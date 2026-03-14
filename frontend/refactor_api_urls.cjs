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

            // 1. Replace "http://localhost:5000/api..." with "/api..."
            const regexLocalhostApi = /("|'|`)http:\/\/localhost:5000(\/api|\/uploads)([^"|'|`]*)("|'|`)/g;
            if (regexLocalhostApi.test(content)) {
                content = content.replace(regexLocalhostApi, '$1$2$3$4');
                modified = true;
            }

            // 2. Replace any remaining http://localhost:5000 exactly
            const regexLocalhost = /http:\/\/localhost:5000/g;
            if (regexLocalhost.test(content)) {
                content = content.replace(regexLocalhost, '');
                modified = true;
            }

            // 3. Replace `${import.meta.env.VITE_API_URL}` exactly
            const regexEnvVar = /\$\{import\.meta\.env\.VITE_API_URL\}/g;
            if (regexEnvVar.test(content)) {
                content = content.replace(regexEnvVar, '');
                modified = true;
            }

            // 4. Sometimes it is import.meta.env.VITE_API_URL + "/api"
            const regexEnvVarNoBraces = /import\.meta\.env\.VITE_API_URL\s*\+\s*("|'|`)(\/api|\/uploads)([^"|'|`]*)("|'|`)/g;
            if (regexEnvVarNoBraces.test(content)) {
                content = content.replace(regexEnvVarNoBraces, '$1$2$3$4');
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

// Also check api.js
const apiPath = path.join(__dirname, 'src', 'assets', 'api', 'api.js');
let apiContent = fs.readFileSync(apiPath, 'utf8');
if (apiContent.includes('import.meta.env.VITE_API_URL')) {
    apiContent = apiContent.replace(/`?\$\{import\.meta\.env\.VITE_API_URL\}\/api`?/, '"/api"');
    fs.writeFileSync(apiPath, apiContent, 'utf8');
    console.log(`Replaced in ${apiPath}`);
}


console.log('Replacement complete.');
