const fs = require('fs');
const path = require('path');

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  fail('Usage: node ua-tour-analyze.js <input.json> <output.json>');
}

try {
  const input = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const nodes = Array.isArray(input.nodes) ? input.nodes : [];
  const edges = Array.isArray(input.edges) ? input.edges : [];
  const layers = Array.isArray(input.layers) ? input.layers : [];
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const fanIn = new Map(nodes.map((node) => [node.id, 0]));
  const fanOut = new Map(nodes.map((node) => [node.id, 0]));

  for (const edge of edges) {
    if (fanOut.has(edge.source)) fanOut.set(edge.source, fanOut.get(edge.source) + 1);
    if (fanIn.has(edge.target)) fanIn.set(edge.target, fanIn.get(edge.target) + 1);
  }

  const rank = (counts, key) => nodes
    .map((node) => ({ id: node.id, [key]: counts.get(node.id) || 0, name: node.name }))
    .sort((a, b) => b[key] - a[key] || a.id.localeCompare(b.id))
    .slice(0, 20);
  const fanInRanking = rank(fanIn, 'fanIn');
  const fanOutRanking = rank(fanOut, 'fanOut');

  const fanOutValues = [...fanOut.values()].sort((a, b) => a - b);
  const fanInValues = [...fanIn.values()].sort((a, b) => a - b);
  const percentile = (values, p) => values.length
    ? values[Math.max(0, Math.min(values.length - 1, Math.floor((values.length - 1) * p)))]
    : 0;
  const highFanOutThreshold = percentile(fanOutValues, 0.9);
  const lowFanInThreshold = percentile(fanInValues, 0.25);
  const codeEntryNames = new Set([
    'index.ts', 'index.tsx', 'index.js', 'index.jsx', 'main.ts', 'main.tsx',
    'main.js', 'main.jsx', 'app.ts', 'app.tsx', 'app.js', 'app.jsx',
    'server.ts', 'server.js', 'mod.rs', 'main.go', 'main.py', 'main.rs',
    'manage.py', 'app.py', 'wsgi.py', 'asgi.py', 'run.py', '__main__.py',
    'application.java', 'main.java', 'program.cs', 'config.ru', 'index.php',
    'app.swift', 'application.kt', 'main.cpp', 'main.c',
  ]);

  const entryPointCandidates = nodes.map((node) => {
    const filePath = String(node.filePath || node.name || '').replace(/\\/g, '/');
    const basename = path.posix.basename(filePath).toLowerCase();
    const depth = filePath.split('/').filter(Boolean).length;
    let score = 0;
    if (node.type === 'file') {
      if (codeEntryNames.has(basename)) score += 3;
      if (depth <= 2) score += 1;
      if ((fanOut.get(node.id) || 0) >= highFanOutThreshold) score += 1;
      if ((fanIn.get(node.id) || 0) <= lowFanInThreshold) score += 1;
    } else if (node.type === 'document') {
      if (filePath.toLowerCase() === 'readme.md') score += 5;
      else if (depth === 1 && basename.endsWith('.md')) score += 2;
    }
    return { id: node.id, score, name: node.name, summary: node.summary || '' };
  }).filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
    .slice(0, 5);

  const topCodeEntry = entryPointCandidates.find((candidate) => {
    const node = nodeById.get(candidate.id);
    return node && node.type === 'file';
  }) || nodes.map((node) => ({
    node,
    score: (fanOut.get(node.id) || 0),
  })).filter(({ node }) => node.type === 'file')
    .sort((a, b) => b.score - a.score || a.node.id.localeCompare(b.node.id))
    .map(({ node }) => ({ id: node.id }))[0];

  const bfsTraversal = { startNode: topCodeEntry ? topCodeEntry.id : null, order: [], depthMap: {}, byDepth: {} };
  if (topCodeEntry) {
    const adjacency = new Map();
    for (const edge of edges) {
      if (!['imports', 'calls'].includes(edge.type)) continue;
      if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
      adjacency.get(edge.source).push(edge.target);
    }
    for (const targets of adjacency.values()) targets.sort();
    const queue = [topCodeEntry.id];
    bfsTraversal.depthMap[topCodeEntry.id] = 0;
    while (queue.length) {
      const current = queue.shift();
      const depth = bfsTraversal.depthMap[current];
      bfsTraversal.order.push(current);
      if (!bfsTraversal.byDepth[String(depth)]) bfsTraversal.byDepth[String(depth)] = [];
      bfsTraversal.byDepth[String(depth)].push(current);
      for (const target of adjacency.get(current) || []) {
        if (!(target in bfsTraversal.depthMap)) {
          bfsTraversal.depthMap[target] = depth + 1;
          queue.push(target);
        }
      }
    }
  }

  const inventory = (types) => nodes.filter((node) => types.includes(node.type)).map((node) => ({
    id: node.id,
    name: node.name,
    type: node.type,
    summary: node.summary || '',
  }));
  const nonCodeFiles = {
    documentation: inventory(['document']),
    infrastructure: inventory(['service', 'pipeline', 'resource']),
    data: inventory(['table', 'schema', 'endpoint']),
    config: inventory(['config']),
  };

  const relationshipTypes = new Set(['imports', 'calls']);
  const directedPairs = new Set(edges.filter((edge) => relationshipTypes.has(edge.type))
    .map((edge) => `${edge.source}\u0000${edge.target}`));
  const seedPairs = [];
  for (const pair of directedPairs) {
    const [source, target] = pair.split('\u0000');
    if (source < target && directedPairs.has(`${target}\u0000${source}`)) seedPairs.push([source, target]);
  }
  const undirectedAdj = new Map(nodes.map((node) => [node.id, new Set()]));
  for (const edge of edges) {
    if (!relationshipTypes.has(edge.type) || !undirectedAdj.has(edge.source) || !undirectedAdj.has(edge.target)) continue;
    undirectedAdj.get(edge.source).add(edge.target);
    undirectedAdj.get(edge.target).add(edge.source);
  }
  const clusterKeys = new Set();
  const clusters = [];
  for (const pair of seedPairs) {
    const cluster = new Set(pair);
    const candidates = nodes.map((node) => node.id).filter((id) => !cluster.has(id));
    let expanded = true;
    while (expanded && cluster.size < 5) {
      expanded = false;
      const candidate = candidates.filter((id) => !cluster.has(id)).map((id) => ({
        id,
        links: [...(undirectedAdj.get(id) || [])].filter((other) => cluster.has(other)).length,
      })).filter((item) => item.links >= 2)
        .sort((a, b) => b.links - a.links || a.id.localeCompare(b.id))[0];
      if (candidate) {
        cluster.add(candidate.id);
        expanded = true;
      }
    }
    const clusterNodes = [...cluster].sort();
    const key = clusterNodes.join('|');
    if (clusterKeys.has(key)) continue;
    clusterKeys.add(key);
    const edgeCount = edges.filter((edge) => cluster.has(edge.source) && cluster.has(edge.target)).length;
    clusters.push({ nodes: clusterNodes, edgeCount });
  }
  clusters.sort((a, b) => b.edgeCount - a.edgeCount || b.nodes.length - a.nodes.length || a.nodes[0].localeCompare(b.nodes[0]));

  const nodeSummaryIndex = Object.fromEntries(nodes.map((node) => [node.id, {
    name: node.name,
    type: node.type,
    summary: node.summary || '',
  }]));

  const result = {
    scriptCompleted: true,
    entryPointCandidates,
    fanInRanking,
    fanOutRanking,
    bfsTraversal,
    nonCodeFiles,
    clusters: clusters.slice(0, 10),
    layers: { count: layers.length, list: layers.map(({ id, name, description }) => ({ id, name, description })) },
    nodeSummaryIndex,
    totalNodes: nodes.length,
    totalEdges: edges.length,
  };
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
} catch (error) {
  fail(error && error.stack ? error.stack : String(error));
}
