#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Path to the problematic Vite file (this will be determined dynamically)
let viteFilePaths = [];

// Find all potential Vite middleware files that might contain the problematic code
function findViteFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      // Skip node_modules within node_modules to avoid deep recursion
      if (fullPath.includes('node_modules') &&
          fullPath.split('node_modules').length > 2 &&
          !fullPath.includes('@angular/build/node_modules/vite')) {
        continue;
      }
      findViteFiles(fullPath);
    } else if (file.name.endsWith('.js') && fullPath.includes('vite') && fullPath.includes('dist')) {
      // Read the file content
      const content = fs.readFileSync(fullPath, 'utf8');

      // Check if the file contains the problematic code (decodeURI usage in middleware)
      if (content.includes('decodeURI') &&
          (content.includes('middleware') || content.includes('transform'))) {
        viteFilePaths.push(fullPath);
        console.log('Found potential Vite file:', fullPath);
      }
    }
  }
}

// Patch all found Vite files
function patchViteFiles() {
  let patchedCount = 0;

  for (const filePath of viteFilePaths) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Back up the original file
    const backupPath = `${filePath}.backup`;
    if (!fs.existsSync(backupPath)) {
      fs.writeFileSync(backupPath, content);
      console.log(`Backed up original file to ${backupPath}`);
    }

    // Replace direct decodeURI calls with a safe version
    const patchedContent = content.replace(
      /decodeURI\s*\(/g,
      'function safeDecodeURI(uri) { try { return decodeURI(uri); } catch (e) { console.warn("URI decoding error prevented:", uri); return uri; } }; safeDecodeURI('
    );

    // Only write if we actually changed something
    if (patchedContent !== content) {
      fs.writeFileSync(filePath, patchedContent);
      console.log(`Patched file: ${filePath}`);
      patchedCount++;
    }
  }

  return patchedCount;
}

// Main process
console.log('🔍 Searching for Vite middleware files...');
findViteFiles(path.join(process.cwd(), 'node_modules'));

if (viteFilePaths.length === 0) {
  console.log('❌ No Vite middleware files found. Unable to apply patch.');
  process.exit(1);
}

console.log(`🔧 Found ${viteFilePaths.length} potential files to patch.`);
const patchedCount = patchViteFiles();
console.log(`✅ Successfully patched ${patchedCount} files.`);

// Now start the Angular application using the original start command
console.log('🚀 Starting Angular application...');
const ngProcess = spawn('ng', ['serve'], {
  stdio: 'inherit',
  shell: true
});

ngProcess.on('error', (err) => {
  console.error('Failed to start Angular application:', err);
  process.exit(1);
});

// Forward signals to the child process
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    ngProcess.kill(signal);
  });
});

// Exit with the same code as the Angular process
ngProcess.on('close', (code) => {
  process.exit(code);
});
