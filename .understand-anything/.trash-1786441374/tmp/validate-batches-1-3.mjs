import fs from 'node:fs';
import path from 'node:path';

const root = 'C:/Users/EDY/Desktop/ngap';
const dir = path.join(root, '.understand-anything/intermediate');
const all = JSON.parse(fs.readFileSync(path.join(dir, 'batches.json'), 'utf8')).batches;

const requested = process.argv.slice(2).map(Number).filter(Number.isInteger);
const batchIndices = requested.length ? requested : [1, 2, 3];

for (const batchIndex of batchIndices) {
  const batch = all.find((entry) => entry.batchIndex === batchIndex);
  const names = fs.readdirSync(dir).filter((name) => new RegExp(`^batch-${batchIndex}(?:-part-\\d+)?\\.json$`).test(name));
  if (!names.length) throw new Error(`batch ${batchIndex}: no output`);
  const fragments = names.map((name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8')));
  const nodes = fragments.flatMap((fragment) => fragment.nodes);
  const edges = fragments.flatMap((fragment) => fragment.edges);
  const fileLevelTypes = new Set(['file', 'config', 'document', 'service', 'pipeline', 'schema', 'resource']);
  const fileNodes = nodes.filter((node) => fileLevelTypes.has(node.type));
  const batchPaths = new Set(batch.files.map((file) => file.path));
  if (fileNodes.length !== batchPaths.size) throw new Error(`batch ${batchIndex}: file node mismatch`);
  for (const filePath of batchPaths) {
    if (!fileNodes.some((node) => node.filePath === filePath)) throw new Error(`batch ${batchIndex}: missing ${filePath}`);
  }
  const imports = edges.filter((edge) => edge.type === 'imports');
  const expectedImports = batch.files.reduce((sum, file) => sum + (batch.batchImportData[file.path] || []).length, 0);
  if (imports.length !== expectedImports) throw new Error(`batch ${batchIndex}: imports ${imports.length}/${expectedImports}`);
  for (const node of nodes) {
    for (const key of ['id', 'type', 'name', 'summary', 'tags', 'complexity']) {
      if (node[key] == null || node[key] === '' || (Array.isArray(node[key]) && !node[key].length)) throw new Error(`batch ${batchIndex}: node ${node.id} lacks ${key}`);
    }
    if ((node.type === 'function' || node.type === 'class') && (!Array.isArray(node.lineRange) || node.lineRange.length !== 2)) {
      throw new Error(`batch ${batchIndex}: ${node.id} lacks lineRange`);
    }
  }
  for (const edge of edges) {
    for (const key of ['source', 'target', 'type', 'direction', 'weight']) {
      if (edge[key] == null || edge[key] === '') throw new Error(`batch ${batchIndex}: edge lacks ${key}`);
    }
  }
  process.stdout.write(`batch ${batchIndex}: ${names.join(', ')}; files=${fileNodes.length}; nodes=${nodes.length}; edges=${edges.length}; imports=${imports.length}\n`);
}
