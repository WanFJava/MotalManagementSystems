const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Open zip via PowerShell to extract document.xml
const p = 'C:\\Users\\nguye\\Downloads\\Report4_Software_Design_Document.docx';
const stat = fs.statSync(p);
console.log('Docx file size:', stat.size);
