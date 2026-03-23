const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend', 'src', 'assets', 'components', 'dashboard', 'userdeshboards', 'admin', 'pages');

const excludeFiles = ['AdminHome.jsx'];

function r(content, regexStr, replacement) {
  return content.replace(new RegExp(`\\b${regexStr}\\b`, 'g'), replacement);
}

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove shadows completely
    content = r(content, 'shadow-2xl', '');
    content = r(content, 'shadow-xl', '');
    content = r(content, 'shadow-lg', '');
    content = r(content, 'shadow-md', '');
    content = r(content, 'shadow-sm', '');
    content = content.replace(/\bshadow\b/g, '');

    // Backgrounds & Surface Cards
    content = r(content, 'bg-white', 'bg-[#1A1B1E] border border-[#2A2B2F]');
    content = r(content, 'bg-gray-50', 'bg-[#121212]');
    content = r(content, 'bg-gray-100', 'bg-[#121212]');
    content = r(content, 'bg-gray-200', 'bg-[#2A2B2F]');
    content = r(content, 'bg-gray-800', 'bg-[#1A1B1E]');
    content = r(content, 'bg-gray-900', 'bg-[#121212]');
    content = r(content, 'hover:bg-gray-50', 'hover:bg-[#2A2B2F]');
    content = r(content, 'hover:bg-gray-100', 'hover:bg-[#2A2B2F]');
    // also specific colors sometimes used for background layouts
    content = r(content, 'bg-\\[#f8fafc\\]', 'bg-[#121212]');
    content = r(content, 'bg-\\[#f9fafb\\]', 'bg-[#121212]');

    // Border Colors
    content = r(content, 'border-gray-100', 'border-[#2A2B2F]');
    content = r(content, 'border-gray-200', 'border-[#2A2B2F]');
    content = r(content, 'border-gray-300', 'border-[#2A2B2F]');
    content = r(content, 'border-gray-400', 'border-[#2A2B2F]');
    content = r(content, 'border-gray-500', 'border-[#2A2B2F]');
    content = r(content, 'border-gray-600', 'border-[#2A2B2F]');
    content = r(content, 'divide-gray-100', 'divide-[#2A2B2F]');
    content = r(content, 'divide-gray-200', 'divide-[#2A2B2F]');
    content = r(content, 'divide-gray-300', 'divide-[#2A2B2F]');

    // Text Colors
    content = r(content, 'text-gray-900', 'text-white');
    content = r(content, 'text-gray-800', 'text-white');
    content = r(content, 'text-gray-700', 'text-gray-200');
    content = r(content, 'text-gray-600', 'text-[#8E929C]');
    content = r(content, 'text-gray-500', 'text-[#8E929C]');
    content = r(content, 'text-gray-400', 'text-[#6B7280]');
    
    // Primary Button Colors
    content = r(content, 'bg-blue-600', 'bg-white text-black');
    content = r(content, 'hover:bg-blue-700', 'hover:bg-gray-200');
    content = r(content, 'bg-indigo-600', 'bg-white text-black');
    content = r(content, 'hover:bg-indigo-700', 'hover:bg-gray-200');
    content = r(content, 'text-blue-600', 'text-blue-400');
    content = r(content, 'text-indigo-600', 'text-indigo-400');

    // Fix double text-color issues
    content = content.replace(/text-white\s+bg-white text-black/g, 'bg-white text-black');
    content = content.replace(/bg-white text-black\s+text-white/g, 'bg-white text-black');

    // Focus rings
    content = r(content, 'focus:border-blue-500', 'focus:border-white');
    content = r(content, 'focus:ring-blue-500', 'focus:ring-0');
    content = r(content, 'focus:border-indigo-500', 'focus:border-white');
    content = r(content, 'focus:ring-indigo-500', 'focus:ring-0');

    // Tables
    content = r(content, 'bg-gray-50', 'bg-[#1A1B1E]'); // Fallback if table headers used bg-gray-50 again

    fs.writeFileSync(filePath, content, 'utf8');
}

if(fs.existsSync(directoryPath)) {
    const files = fs.readdirSync(directoryPath);
    files.forEach(file => {
        if (file.endsWith('.jsx') && !excludeFiles.includes(file)) {
            processFile(path.join(directoryPath, file));
            console.log(`Processed ${file}`);
        }
    });
} else {
    console.log("Directory not found:", directoryPath);
}
