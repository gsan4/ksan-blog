import fs from 'fs';

const text = fs.readFileSync('extracted_2.txt', 'utf8');

// Unescape escaped quotes and newlines
const cleanCode = text
  .replace(/\\n/g, '\n')
  .replace(/\\"/g, '"')
  .replace(/\\'/g, "'");

fs.writeFileSync('clean_extracted.ts', cleanCode, 'utf8');
console.log("Saved clean_extracted.ts, length:", cleanCode.length);
