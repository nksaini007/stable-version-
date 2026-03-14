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

            // Replace in double quotes: "http://127.0.0.1:5000/something" -> `${import.meta.env.VITE_API_URL}/something`
            const regexDoubleQuotes = /"http:\/\/127\.0\.0\.1:5000([^"]*)"/g;
            if (regexDoubleQuotes.test(content)) {
                content = content.replace(regexDoubleQuotes, '`${import.meta.env.VITE_API_URL}$1`');
                modified = true;
            }

            // Replace in single quotes: 'http://127.0.0.1:5000/something' -> `${import.meta.env.VITE_API_URL}/something`
            const regexSingleQuotes = /'http:\/\/127\.0\.0\.1:5000([^']*)'/g;
            if (regexSingleQuotes.test(content)) {
                content = content.replace(regexSingleQuotes, '`${import.meta.env.VITE_API_URL}$1`');
                modified = true;
            }

            // Replace in template literals: `http://127.0.0.1:5000${something}` -> `${import.meta.env.VITE_API_URL}${something}`
            const regexTemplate = /http:\/\/127\.0\.0\.1:5000/g;
            if (regexTemplate.test(content)) {
                content = content.replace(regexTemplate, '${import.meta.env.VITE_API_URL}');
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
