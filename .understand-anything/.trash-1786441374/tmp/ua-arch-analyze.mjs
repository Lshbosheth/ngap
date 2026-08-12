import fs from 'node:fs';
import path from 'node:path';

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  console.error('Usage: node ua-arch-analyze.mjs <input.json> <output.json>');
  process.exit(1);
}

try {
  const { fileNodes, importEdges, allEdges } = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const normalize = (value = '') => value.replaceAll('\\', '/').replace(/^\.\//, '');
  const paths = fileNodes.map((node) => normalize(node.filePath || node.name));
  const splitPaths = paths.map((filePath) => filePath.split('/').filter(Boolean));
  let commonParts = splitPaths[0]?.slice(0, -1) ?? [];
  for (const parts of splitPaths.slice(1)) {
    let index = 0;
    while (index < commonParts.length && commonParts[index] === parts[index]) index += 1;
    commonParts = commonParts.slice(0, index);
  }
  const commonPrefix = commonParts.length ? `${commonParts.join('/')}/` : '';

  const flatProject = splitPaths.every((parts) => parts.length <= 1);
  const extensionGroup = (filePath) => {
    const base = path.posix.basename(filePath).toLowerCase();
    if (/\.(test|spec)\./.test(base)) return 'test';
    if (/(^|\.)config\./.test(base) || ['package.json', 'tsconfig.json'].includes(base)) return 'config';
    return path.posix.extname(base).replace(/^\./, '') || 'root';
  };
  const groupForPath = (filePath) => {
    if (flatProject) return extensionGroup(filePath);
    const remainder = commonPrefix && filePath.startsWith(commonPrefix)
      ? filePath.slice(commonPrefix.length)
      : filePath;
    const parts = remainder.split('/').filter(Boolean);
    return parts.length > 1 ? parts[0] : 'root';
  };

  const directoryGroups = {};
  const nodeGroup = new Map();
  for (const node of fileNodes) {
    const group = groupForPath(normalize(node.filePath || node.name));
    (directoryGroups[group] ??= []).push(node.id);
    nodeGroup.set(node.id, group);
  }

  const nodeTypeGroups = {};
  for (const node of fileNodes) (nodeTypeGroups[node.type] ??= []).push(node.id);

  const fileFanIn = Object.fromEntries(fileNodes.map((node) => [node.id, 0]));
  const fileFanOut = Object.fromEntries(fileNodes.map((node) => [node.id, 0]));
  const importsFrom = {};
  const importedBy = {};
  const interGroupCounts = new Map();
  for (const edge of importEdges) {
    fileFanOut[edge.source] = (fileFanOut[edge.source] ?? 0) + 1;
    fileFanIn[edge.target] = (fileFanIn[edge.target] ?? 0) + 1;
    const from = nodeGroup.get(edge.source);
    const to = nodeGroup.get(edge.target);
    if (!from || !to) continue;
    (importsFrom[from] ??= new Set()).add(to);
    (importedBy[to] ??= new Set()).add(from);
    const key = `${from}\u0000${to}`;
    interGroupCounts.set(key, (interGroupCounts.get(key) ?? 0) + 1);
  }
  const directoryImportAdjacency = {};
  for (const group of Object.keys(directoryGroups)) {
    directoryImportAdjacency[group] = {
      importsFrom: [...(importsFrom[group] ?? [])].sort(),
      importedBy: [...(importedBy[group] ?? [])].sort(),
    };
  }

  const crossCounts = new Map();
  const nodeType = new Map(fileNodes.map((node) => [node.id, node.type]));
  const nonCodeConnections = {};
  for (const edge of allEdges) {
    const fromType = nodeType.get(edge.source);
    const toType = nodeType.get(edge.target);
    if (!fromType || !toType) continue;
    const key = `${fromType}\u0000${toType}\u0000${edge.type}`;
    crossCounts.set(key, (crossCounts.get(key) ?? 0) + 1);
    if (fromType !== 'file' || toType !== 'file') {
      (nonCodeConnections[edge.source] ??= []).push({ target: edge.target, type: edge.type });
    }
  }
  const crossCategoryEdges = [...crossCounts.entries()].map(([key, count]) => {
    const [fromType, toType, edgeType] = key.split('\u0000');
    return { fromType, toType, edgeType, count };
  }).sort((a, b) => b.count - a.count);

  const interGroupImports = [...interGroupCounts.entries()].map(([key, count]) => {
    const [from, to] = key.split('\u0000');
    return { from, to, count };
  }).sort((a, b) => b.count - a.count);

  const intraGroupDensity = {};
  for (const group of Object.keys(directoryGroups)) {
    let internalEdges = 0;
    let totalEdges = 0;
    for (const edge of importEdges) {
      const from = nodeGroup.get(edge.source);
      const to = nodeGroup.get(edge.target);
      if (from === group || to === group) totalEdges += 1;
      if (from === group && to === group) internalEdges += 1;
    }
    intraGroupDensity[group] = {
      internalEdges,
      totalEdges,
      density: totalEdges ? Number((internalEdges / totalEdges).toFixed(4)) : 0,
    };
  }

  const directoryPatterns = [
    [/^(routes?|api|controllers?|endpoints?|handlers?|serializers?|routers?|blueprints?)$/i, 'api'],
    [/^(services?|core|lib|domain|logic|internal|signals|composables|mailers|jobs|channels)$/i, 'service'],
    [/^(models?|db|data|persistence|repositories?|entities|entity|migrations?|sql|database|schema)$/i, 'data'],
    [/^(components?|views?|pages?|ui|layouts?|screens)$/i, 'ui'],
    [/^(middleware|plugins?|interceptors?|guards)$/i, 'middleware'],
    [/^(utils?|helpers?|common|shared|tools|pkg|templatetags)$/i, 'utility'],
    [/^(config|constants|env|settings|management)$/i, 'config'],
    [/^(__tests__|tests?|specs?)$/i, 'test'],
    [/^(types?|interfaces?|schemas?|contracts?|dtos?|dto|request|response)$/i, 'types'],
    [/^hooks$/i, 'hooks'],
    [/^(stores?|state|reducers?|actions?|slices)$/i, 'state'],
    [/^(assets?|static|public)$/i, 'assets'],
    [/^(cmd|bin)$/i, 'entry'],
    [/^(docs?|documentation|wiki)$/i, 'documentation'],
    [/^(deploy|deployment|infra|infrastructure|docker|k8s|kubernetes|helm|charts|terraform|tf)$/i, 'infrastructure'],
    [/^(\.github|\.gitlab|\.circleci)$/i, 'ci-cd'],
  ];
  const patternMatches = {};
  for (const group of Object.keys(directoryGroups)) {
    patternMatches[group] = directoryPatterns.find(([pattern]) => pattern.test(group))?.[1] ?? 'unclassified';
  }

  const lowerPaths = paths.map((filePath) => filePath.toLowerCase());
  const isInfra = (filePath) => /(^|\/)(dockerfile[^/]*|docker-compose[^/]*|jenkinsfile|makefile)$/.test(filePath)
    || /(^|\/)(k8s|kubernetes|helm|charts|terraform|infra|infrastructure|deploy|deployment)(\/|$)/.test(filePath)
    || /\.(tf|tfvars)$/.test(filePath);
  const infraFiles = paths.filter((filePath) => isInfra(filePath.toLowerCase()));
  const deploymentTopology = {
    hasDockerfile: lowerPaths.some((filePath) => /(^|\/)dockerfile[^/]*$/.test(filePath)),
    hasCompose: lowerPaths.some((filePath) => /(^|\/)docker-compose[^/]*$/.test(filePath)),
    hasK8s: lowerPaths.some((filePath) => /(^|\/)(k8s|kubernetes|helm|charts)(\/|$)/.test(filePath)),
    hasTerraform: lowerPaths.some((filePath) => /(^|\/)terraform(\/|$)/.test(filePath) || /\.(tf|tfvars)$/.test(filePath)),
    hasCI: lowerPaths.some((filePath) => /(^|\/)(\.github\/workflows|\.gitlab-ci\.yml|jenkinsfile|\.circleci)(\/|$)/.test(filePath)),
    infraFiles,
  };

  const schemaFiles = paths.filter((filePath) => /\.(sql|graphql|gql|proto|prisma)$/i.test(filePath));
  const migrationFiles = paths.filter((filePath) => /(^|\/)migrations?(\/|$)/i.test(filePath));
  const dataModelFiles = fileNodes.filter((node) => {
    const filePath = normalize(node.filePath || node.name);
    return /(^|\/)(models?|entities|entity|data)(\/|$)/i.test(filePath)
      || (node.tags ?? []).some((tag) => ['data-model', 'entity', 'model'].includes(String(tag).toLowerCase()));
  }).map((node) => normalize(node.filePath || node.name));
  const apiHandlerFiles = fileNodes.filter((node) => {
    const filePath = normalize(node.filePath || node.name);
    return /(^|\/)(routes?|api|controllers?|handlers?|endpoints?)(\/|$)/i.test(filePath)
      || (node.tags ?? []).some((tag) => ['api-handler', 'endpoint', 'controller'].includes(String(tag).toLowerCase()));
  }).map((node) => normalize(node.filePath || node.name));
  const dataPipeline = { schemaFiles, migrationFiles, dataModelFiles, apiHandlerFiles };

  const documentNodes = fileNodes.filter((node) => node.type === 'document' || /\.(md|rst)$/i.test(node.filePath || ''));
  const groupsWithDocs = new Set();
  for (const node of documentNodes) {
    const docPath = normalize(node.filePath || node.name);
    const docGroup = nodeGroup.get(node.id);
    if (/readme\.md$/i.test(docPath) && docGroup) groupsWithDocs.add(docGroup);
    const text = `${node.summary ?? ''} ${(node.tags ?? []).join(' ')}`.toLowerCase();
    for (const group of Object.keys(directoryGroups)) {
      if (text.includes(group.toLowerCase())) groupsWithDocs.add(group);
    }
  }
  const totalGroups = Object.keys(directoryGroups).length;
  const docCoverage = {
    groupsWithDocs: groupsWithDocs.size,
    totalGroups,
    coverageRatio: totalGroups ? Number((groupsWithDocs.size / totalGroups).toFixed(4)) : 0,
    undocumentedGroups: Object.keys(directoryGroups).filter((group) => !groupsWithDocs.has(group)),
  };

  const dependencyDirection = [];
  const processedPairs = new Set();
  for (const { from, to, count } of interGroupImports) {
    if (from === to) continue;
    const pair = [from, to].sort().join('\u0000');
    if (processedPairs.has(pair)) continue;
    processedPairs.add(pair);
    const reverseCount = interGroupCounts.get(`${to}\u0000${from}`) ?? 0;
    if (count > reverseCount) dependencyDirection.push({ dependent: from, dependsOn: to, count, reverseCount });
    else if (reverseCount > count) dependencyDirection.push({ dependent: to, dependsOn: from, count: reverseCount, reverseCount: count });
    else dependencyDirection.push({ dependent: from, dependsOn: to, count, reverseCount, bidirectional: true });
  }

  const results = {
    scriptCompleted: true,
    commonPrefix,
    directoryGroups,
    nodeTypeGroups,
    directoryImportAdjacency,
    crossCategoryEdges,
    nonCodeConnections,
    interGroupImports,
    intraGroupDensity,
    patternMatches,
    deploymentTopology,
    dataPipeline,
    docCoverage,
    dependencyDirection,
    fileStats: {
      totalFileNodes: fileNodes.length,
      filesPerGroup: Object.fromEntries(Object.entries(directoryGroups).map(([group, ids]) => [group, ids.length])),
      nodeTypeCounts: Object.fromEntries(Object.entries(nodeTypeGroups).map(([type, ids]) => [type, ids.length])),
    },
    fileFanIn,
    fileFanOut,
  };
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(JSON.stringify(results.fileStats));
} catch (error) {
  console.error(error?.stack || String(error));
  process.exit(1);
}
