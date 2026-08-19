const fs = require('fs');
const path = require('path');

console.log("Starting refactoring process...");

// 1. Move package.json and package-lock.json to root
const jsDir = path.join(__dirname, 'js');
['package.json', 'package-lock.json'].forEach(file => {
    const src = path.join(jsDir, file);
    const dest = path.join(__dirname, file);
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`Moved ${file} to root.`);
    }
});

// 2. Rename login_3.html to login.html
const oldLogin = path.join(__dirname, 'login_3.html');
const newLogin = path.join(__dirname, 'login.html');
if (fs.existsSync(oldLogin)) {
    fs.renameSync(oldLogin, newLogin);
    console.log("Renamed login_3.html to login.html.");
}

// 3. Create vendor directory and move GSAP files
const vendorDir = path.join(jsDir, 'vendor');
if (!fs.existsSync(vendorDir)) {
    fs.mkdirSync(vendorDir);
}

const vendorFiles = ['Draggable.min.js', 'InertiaPlugin.min.js', 'ScrollTrigger.min.js', 'gsap.min.js'];
vendorFiles.forEach(file => {
    const src = path.join(jsDir, file);
    const dest = path.join(vendorDir, file);
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`Moved ${file} to vendor folder.`);
    }
});

// 4. Update index.html to reflect vendor paths and login.html
const indexHtmlPath = path.join(__dirname, 'index.html');
if (fs.existsSync(indexHtmlPath)) {
    let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    indexHtml = indexHtml.replace(/src="js\/gsap\.min\.js"/g, 'src="js/vendor/gsap.min.js"');
    indexHtml = indexHtml.replace(/src="js\/Draggable\.min\.js"/g, 'src="js/vendor/Draggable.min.js"');
    indexHtml = indexHtml.replace(/src="js\/InertiaPlugin\.min\.js"/g, 'src="js/vendor/InertiaPlugin.min.js"');
    indexHtml = indexHtml.replace(/src="js\/ScrollTrigger\.min\.js"/g, 'src="js/vendor/ScrollTrigger.min.js"');
    indexHtml = indexHtml.replace(/login_3\.html/g, 'login.html');
    fs.writeFileSync(indexHtmlPath, indexHtml);
    console.log("Updated index.html references.");
}

// 5. Update main.js references to login_3.html
const mainJsPath = path.join(jsDir, 'main.js');
if (fs.existsSync(mainJsPath)) {
    let mainJs = fs.readFileSync(mainJsPath, 'utf8');
    mainJs = mainJs.replace(/login_3\.html/g, 'login.html');
    fs.writeFileSync(mainJsPath, mainJs);
    console.log("Updated main.js references.");
}

// 6. Extract inline CSS and JS from login.html
if (fs.existsSync(newLogin)) {
    let loginHtml = fs.readFileSync(newLogin, 'utf8');

    // Extract styles
    const styleRegex = /<style>([\s\S]*?)<\/style>/;
    const styleMatch = loginHtml.match(styleRegex);
    if (styleMatch) {
        fs.writeFileSync(path.join(__dirname, 'css', 'login.css'), styleMatch[1].trim());
        loginHtml = loginHtml.replace(styleRegex, '<link rel="stylesheet" href="css/login.css">');
        console.log("Extracted css/login.css");
    }

    // Extract scripts (excluding the Firebase scripts above it which don't match this regex if we target the last script)
    const scriptRegex = /<script>\s*const fragmentShaderSource[\s\S]*?<\/script>\s*<\/body>/;
    const scriptMatch = loginHtml.match(scriptRegex);
    if (scriptMatch) {
        const innerScript = scriptMatch[0].replace(/<script>\s*/, '').replace(/<\/script>\s*<\/body>/, '').trim();
        fs.writeFileSync(path.join(__dirname, 'js', 'login.js'), innerScript);
        loginHtml = loginHtml.replace(scriptRegex, '<script src="js/login.js"></script>\n</body>');
        console.log("Extracted js/login.js");
    }

    fs.writeFileSync(newLogin, loginHtml);
    console.log("Updated login.html to use external css/js.");
}

console.log("Refactoring complete! You can delete refactor.js now.");
