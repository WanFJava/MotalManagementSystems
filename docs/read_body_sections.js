const fs = require('fs');
const path = require('path');

const tempDir = path.join(process.env.TEMP, 'docx_template');
const docXml = fs.readFileSync(path.join(tempDir, 'word', 'document.xml'), 'utf8');

function extractBodySection(title, endTitle) {
  const first = docXml.indexOf(title);
  const start = docXml.indexOf(title, first + title.length);
  if (start === -1) return '';
  const end = endTitle ? docXml.indexOf(endTitle, start) : start + 3000;
  const chunk = docXml.substring(start, end !== -1 ? end : start + 3000);
  return chunk.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

console.log('=== BODY: 1.1 Architecture ===');
console.log(extractBodySection('1.1 System Architecture', '1.2 Package Diagram'));

console.log('\n=== BODY: 1.2 Package Diagram ===');
console.log(extractBodySection('1.2 Package Diagram', '2. Detailed Design'));
