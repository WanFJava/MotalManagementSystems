const fs = require('fs');
const path = require('path');

const tempDir = path.join(process.env.TEMP, 'docx_template');
const docXml = fs.readFileSync(path.join(tempDir, 'word', 'document.xml'), 'utf8');

function extractSection(title, endTitle) {
  const start = docXml.indexOf(title);
  if (start === -1) return '';
  const end = endTitle ? docXml.indexOf(endTitle, start) : start + 3000;
  const chunk = docXml.substring(start, end !== -1 ? end : start + 3000);
  return chunk.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

console.log('=== 1.1 Architecture ===');
console.log(extractSection('1.1 System Architecture', '1.2 Package Diagram'));

console.log('\n=== 1.2 Package Diagram ===');
console.log(extractSection('1.2 Package Diagram', '2. Detailed Design'));
