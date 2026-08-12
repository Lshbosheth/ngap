import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/EDY/Desktop/ngap';
const batchesPath = path.join(root, '.understand-anything/intermediate/batches.json');
const all = JSON.parse(fs.readFileSync(batchesPath, 'utf8'));

const requested = process.argv.slice(2).map(Number).filter(Number.isInteger);
const batchIndices = requested.length ? requested : [1, 2, 3];

for (const batchIndex of batchIndices) {
  const batch = all.batches.find((entry) => entry.batchIndex === batchIndex);
  if (!batch) throw new Error(`Missing batch ${batchIndex}`);
  const batchFiles = batch.files.map(({ path: filePath, language, sizeLines, fileCategory }) => ({
    path: filePath,
    language,
    sizeLines,
    fileCategory,
  }));
  const input = { projectRoot: root, batchFiles, batchImportData: batch.batchImportData };
  const output = path.join(root, `.understand-anything/tmp/ua-file-analyzer-input-${batchIndex}.json`);
  fs.writeFileSync(output, `${JSON.stringify(input, null, 2)}\n`);
  process.stdout.write(`batch ${batchIndex}: ${batchFiles.length} files\n`);
}
