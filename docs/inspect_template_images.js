const fs = require('fs');
const path = require('path');

const tempDir = path.join(process.env.TEMP, 'docx_template');
const docXml = fs.readFileSync(path.join(tempDir, 'word', 'document.xml'), 'utf8');
const relsXml = fs.readFileSync(path.join(tempDir, 'word', '_rels', 'document.xml.rels'), 'utf8');

// Parse relations
const relMap = {};
const relRegex = /<Relationship[^>]+Id="([^"]+)"[^>]+Target="([^"]+)"/g;
let match;
while ((match = relRegex.exec(relsXml)) !== null) {
  relMap[match[1]] = match[2];
}

// Find figures and images
const paragraphs = docXml.split(/<\/w:p>/);
paragraphs.forEach(p => {
  const text = p.replace(/<[^>]+>/g, '').trim();
  const imgMatch = p.match(/r:embed="([^"]+)"/);
  if (imgMatch) {
    const rid = imgMatch[1];
    const target = relMap[rid] || rid;
    console.log(`Image: ${target} | Associated text: ${text}`);
  } else if (text.startsWith('Figure 1.') || text.startsWith('Figure 3.')) {
    console.log(`Caption: ${text}`);
  }
});
