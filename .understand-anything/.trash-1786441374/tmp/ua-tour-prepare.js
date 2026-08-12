const fs = require('fs');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const [assembledPath, layersPath, outputPath] = process.argv.slice(2);
if (!assembledPath || !layersPath || !outputPath) {
  fail('Usage: node ua-tour-prepare.js <assembled-graph.json> <layers.json> <output.json>');
}

try {
  const assembled = JSON.parse(fs.readFileSync(assembledPath, 'utf8'));
  const layerSource = JSON.parse(fs.readFileSync(layersPath, 'utf8'));
  const fileLevelTypes = new Set([
    'file', 'config', 'document', 'service', 'pipeline', 'resource',
    'table', 'schema', 'endpoint',
  ]);
  const nodes = (assembled.nodes || []).filter((node) => fileLevelTypes.has(node.type));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = (assembled.edges || []).filter(
    (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
  );
  const rawLayers = Array.isArray(layerSource) ? layerSource : (layerSource.layers || []);
  const layers = rawLayers.map(({ id, name, description }) => ({ id, name, description }));
  fs.writeFileSync(outputPath, JSON.stringify({ nodes, edges, layers }, null, 2));
} catch (error) {
  fail(error && error.stack ? error.stack : String(error));
}
