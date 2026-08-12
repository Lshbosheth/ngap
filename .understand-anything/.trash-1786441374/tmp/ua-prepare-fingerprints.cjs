#!/usr/bin/env node
const fs = require('fs');
const [projectRoot, scanPath, outputPath, gitCommitHash] = process.argv.slice(2);
const scan = JSON.parse(fs.readFileSync(scanPath, 'utf8'));
const sourceFilePaths = scan.files.map((file) => file.path);
fs.writeFileSync(outputPath, JSON.stringify({ projectRoot, sourceFilePaths, gitCommitHash }, null, 2));
process.stdout.write(`fingerprint-input: ${sourceFilePaths.length} files\n`);
