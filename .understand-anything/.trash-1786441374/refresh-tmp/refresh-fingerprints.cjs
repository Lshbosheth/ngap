#!/usr/bin/env node
const fs = require('fs');
const [projectRoot, scanPath, inputPath, metaPath] = process.argv.slice(2);
const scan = JSON.parse(fs.readFileSync(scanPath, 'utf8'));
const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
fs.writeFileSync(inputPath, JSON.stringify({
  projectRoot,
  sourceFilePaths: scan.files.map((file) => file.path),
  gitCommitHash: meta.gitCommitHash,
}, null, 2));
meta.lastAnalyzedAt = new Date().toISOString();
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
