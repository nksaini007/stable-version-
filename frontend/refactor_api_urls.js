const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function traverseAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            traverseAndReplace(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Replace "http://localhost:5000/api..." with "/api..."
            const regexLocalhostApi = /("|'|`)http:\/\/localhost:5000(\/api|\/uploads)([^"|'|`]*)("|'|`)/g;
            if (regexLocalhostApi.test(content)) {
                content = content.replace(regexLocalhostApi, '$1$2$3$4');
                modified = true;
            }

            // Fallback: replace any remaining "http://localhost:5000" that might not have /api or /uploads with nothing 
            // Basically if someone did `http://localhost:5000${some_path}`
            const regexLocalhost = /http:\/\/localhost:5000/g;
            if (regexLocalhost.test(content)) {
                content = content.replace(regexLocalhost, '');
                modified = true;
            }

            // Replace occurrences of `${import.meta.env.VITE_API_URL}` with nothing (making it relative)
            const regexEnvVar = /\$\{import\.meta\.env\.VITE_API_URL\}/g;
            if (regexEnvVar.test(content)) {
                content = content.replace(regexEnvVar, '');
                modified = true;
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Replaced in ${fullPath}`);
            }
        }
    }
}

traverseAndReplace(srcDir);
console.log('Replacement complete.');
