const fs = require('fs');
const path = require('path');

const dir = 'e:/laimsoft/laimsoft POS/POS_Desktop_Application/src/components/pagescomponents/settings/tabs/printTab';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.tsx') && !file.includes('ColorGrid') && !file.includes('ThermalSettings')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Only apply to components that take { color } prop
    if (content.includes('{ color') || content.includes('color?: string')) {
      
      // Inject isWhiteTheme definition if not present
      if (!content.includes('const isWhiteTheme =')) {
        const componentMatch = content.match(/export function [A-Za-z0-9_]+\s*\([^)]*\)\s*\{/);
        if (componentMatch) {
          const insertIdx = componentMatch.index + componentMatch[0].length;
          
          // themeBg might be defined later, so we check if color === "#ffffff"
          // We can also extract the actual passed color or default. 
          // Usually color is passed directly as a prop, e.g., { color } or { color: _color }
          
          const toInsert = `
  const isWhiteTheme = color === "#ffffff" || color === "#fff";
`;
          content = content.slice(0, insertIdx) + toInsert + content.slice(insertIdx);
        }
      }

      // Add className={isWhiteTheme ? "print-white-theme" : ""} to the outer div
      // We look for the first return (
      //   <div
      
      const returnMatch = content.match(/return\s*\(\s*<div/);
      if (returnMatch) {
        // Only inject if not already injected
        if (!content.includes('className={isWhiteTheme ? "print-white-theme" : ""}')) {
          content = content.replace(
            /return\s*\(\s*<div/,
            `return (
    <div className={isWhiteTheme ? "print-white-theme" : ""}`
          );
          
          // Also inject the CSS style block right after the outer div
          content = content.replace(
            /className=\{isWhiteTheme \? "print-white-theme" : ""\}([^>]*>)/,
            `className={isWhiteTheme ? "print-white-theme" : ""}$1
      <style>{\`
        .print-white-theme * {
          color: #000 !important;
          border-color: #000 !important;
        }
      \`}</style>`
          );
        }
      }

      fs.writeFileSync(filePath, content);
    }
  }
});
console.log("Applied pure CSS white-theme-override to all applicable themes");
