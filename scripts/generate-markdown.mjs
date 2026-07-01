import fs from 'fs';
import path from 'path';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

const distDir = path.resolve('dist');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

if (!fs.existsSync(distDir)) {
  console.error('dist directory does not exist. Run build first.');
  process.exit(1);
}

console.log('Generating markdown versions of HTML pages...');

walkDir(distDir, (filePath) => {
  if (path.extname(filePath) === '.html') {
    try {
      const htmlContent = fs.readFileSync(filePath, 'utf-8');
      
      // Convert HTML to Markdown
      const markdown = turndownService.turndown(htmlContent);
      
      // Determine the output path (replace .html with .md)
      const mdFilePath = filePath.replace(/\.html$/, '.md');
      fs.writeFileSync(mdFilePath, markdown, 'utf-8');
      console.log(`Created: ${path.relative(distDir, mdFilePath)}`);
    } catch (err) {
      console.error(`Error converting ${filePath}:`, err);
    }
  }
});

console.log('Markdown generation complete!');
