const fs = require('fs');
const path = require('path');

function fixImportsInDir(dirName) {
    const dirPath = path.join(__dirname, '..', 'components', dirName);
    if (!fs.existsSync(dirPath)) return;
    
    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.tsx'));
    
    files.forEach(file => {
        const filePath = path.join(dirPath, file);
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        // 1. Fix StatusBadge (e.g. ../../../components/StatusBadge -> ../StatusBadge)
        content = content.replace(/['"]\.\.\/\.\.\/\.\.\/components\/StatusBadge['"]/g, "'../StatusBadge'");
        
        // 2. Fix lib imports (e.g. ../../lib/... -> @/app/lib/...)
        content = content.replace(/['"]\.\.\/\.\.\/lib\/(.*?)['"]/g, "'@/app/lib/$1'");
        
        if (content !== originalContent) {
            fs.writeFileSync(filePath, content);
            console.log('Fixed imports in components/' + dirName + '/' + file);
        }
    });
}

fixImportsInDir('inventory');
fixImportsInDir('studio');
