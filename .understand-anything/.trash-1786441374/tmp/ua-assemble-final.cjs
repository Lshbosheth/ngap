#!/usr/bin/env node
const fs = require('fs');

const [graphPath, layersPath, tourPath, outputPath, gitCommitHash] = process.argv.slice(2);
const graph = JSON.parse(fs.readFileSync(graphPath, 'utf8'));
const rawLayers = JSON.parse(fs.readFileSync(layersPath, 'utf8'));
const rawTour = JSON.parse(fs.readFileSync(tourPath, 'utf8'));
const layersInput = Array.isArray(rawLayers) ? rawLayers : rawLayers.layers || [];
const tourInput = Array.isArray(rawTour) ? rawTour : rawTour.steps || rawTour.tour || [];
const nodeIds = new Set(graph.nodes.map((node) => node.id));
const prefixes = ['file:', 'config:', 'document:', 'service:', 'pipeline:', 'table:', 'schema:', 'resource:', 'endpoint:'];
const hasPrefix = (id) => prefixes.some((prefix) => String(id).startsWith(prefix));
const kebab = (value) => String(value || 'unnamed')
  .trim()
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]+/gu, '-')
  .replace(/^-+|-+$/g, '') || 'unnamed';
const normalizeIds = (ids) => [...new Set((ids || [])
  .map((value) => typeof value === 'object' && value ? value.id : value)
  .filter(Boolean)
  .map((id) => hasPrefix(id) ? String(id) : `file:${id}`)
  .filter((id) => nodeIds.has(id)))];

const layers = layersInput.map((layer) => ({
  id: layer.id || `layer:${kebab(layer.name)}`,
  name: layer.name || '未命名层',
  description: layer.description || '未提供层说明',
  nodeIds: normalizeIds(layer.nodeIds || layer.nodes),
})).filter((layer) => layer.nodeIds.length > 0);

const tour = tourInput.map((step, index) => ({
  order: Number.isInteger(step.order) ? step.order : index + 1,
  title: step.title || `步骤 ${index + 1}`,
  description: step.description || step.whyItMatters || '未提供步骤说明',
  nodeIds: normalizeIds(step.nodeIds || step.nodesToInspect),
  ...(typeof step.languageLesson === 'string' && step.languageLesson.trim()
    ? { languageLesson: step.languageLesson }
    : {}),
})).filter((step) => step.nodeIds.length > 0)
  .sort((a, b) => a.order - b.order)
  .map((step, index) => ({ ...step, order: index + 1 }));

const finalGraph = {
  version: '1.0.0',
  project: {
    name: 'ngap',
    languages: ['TypeScript', 'JavaScript', 'CSS', 'HTML', 'JSON', 'Markdown', 'PowerShell'],
    frameworks: ['React', 'Vite', 'Zustand'],
    description: '应用集成低代码平台，支持可视化配置、逻辑编排、事件流交互和数据源配置。',
    analyzedAt: new Date().toISOString(),
    gitCommitHash,
  },
  nodes: graph.nodes,
  edges: graph.edges,
  layers,
  tour,
};

fs.writeFileSync(outputPath, JSON.stringify(finalGraph, null, 2));
process.stdout.write(`assembled-final: nodes=${finalGraph.nodes.length} edges=${finalGraph.edges.length} layers=${layers.length} tour=${tour.length}\n`);
