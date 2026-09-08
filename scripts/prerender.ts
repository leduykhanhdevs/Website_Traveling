import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { readFile, writeFile } from 'node:fs/promises';
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { App } = await server.ssrLoadModule('/src/App.tsx');
  const markup = renderToString(createElement(App));
  const path = 'dist/index.html';
  const template = await readFile(path, 'utf8');
  if (!template.includes('<div id="root"></div>')) throw new Error('Missing prerender mount point');
  await writeFile(path, template.replace('<div id="root"></div>', `<div id="root">${markup}</div>`));
  console.log('Prerendered Traveling content into production HTML.');
} finally { await server.close(); }
