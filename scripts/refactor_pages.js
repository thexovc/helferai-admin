const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'app', 'inventory');
const componentsDir = path.join(__dirname, '..', 'components', 'inventory');

// Ensure components directory exists
if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
}

// Function to safely extract component name
function extractComponentName(content) {
    const match = content.match(/export default function\s+([A-Za-z0-9_]+)/);
    return match ? match[1] : null;
}

const ignoreDirs = ['dashboard', 'ai', 'businesses'];

// Read all subdirectories in app/inventory
const dirs = fs.readdirSync(pagesDir).filter(f => {
    return fs.statSync(path.join(pagesDir, f)).isDirectory() && !ignoreDirs.includes(f);
});

dirs.forEach(dir => {
    const pagePath = path.join(pagesDir, dir, 'page.tsx');
    if (!fs.existsSync(pagePath)) return;
    
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Find component name (e.g., BrandsPage)
    const compName = extractComponentName(content);
    if (!compName) return;
    
    const clientCompName = compName + 'Client';
    
    // 1. Create client component
    let clientContent = content.replace(
        /export default function\s+[A-Za-z0-9_]+\s*\(\)/,
        `export default function ${clientCompName}()`
    );
    
    // Fix imports in client component (Topbar is now one level up)
    clientContent = clientContent.replace(
        /import Topbar from '\.\.\/\.\.\/\.\.\/components\/Topbar';/,
        `import Topbar from '../Topbar';`
    );
    
    fs.writeFileSync(path.join(componentsDir, `${clientCompName}.tsx`), clientContent);
    console.log(`Created: components/inventory/${clientCompName}.tsx`);
    
    // 2. Rewrite page.tsx
    const serverContent = `import React from 'react';
import ${clientCompName} from '../../../components/inventory/${clientCompName}';

export default function ${compName}() {
    return <${clientCompName} />;
}
`;
    fs.writeFileSync(pagePath, serverContent);
    console.log(`Refactored: app/inventory/${dir}/page.tsx`);
});
