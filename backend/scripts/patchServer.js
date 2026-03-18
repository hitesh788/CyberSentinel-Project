const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../server.js');
let src = fs.readFileSync(filePath, 'utf8');

const pattern = /const PORT = process\.env\.PORT \|\| 5000;[\s\S]*$/m;
const replacement = `// When running locally, start an HTTP listener.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('CyberSentinel server running on port', PORT);
  });
}

module.exports = app;
`;

if (!pattern.test(src)) {
  console.error('Pattern not found; aborting');
  process.exit(1);
}

fs.writeFileSync(filePath, src.replace(pattern, replacement), 'utf8');
console.log('server.js updated');
