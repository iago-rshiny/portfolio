/* =========================================================================
   server.js — servidor local (só para desenvolvimento).
   Serve os arquivos do site e a rota /api/ask, igual à Vercel.

     npm run dev:mock   → resposta simulada, não chama a API
     npm run dev        → chama a API de verdade (precisa de ANTHROPIC_API_KEY no .env)
   ========================================================================= */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* sem .env */ }
const ask = require('./api/ask.js');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 3000;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.pdf': 'application/pdf', '.json': 'application/json; charset=utf-8'
};

http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (pathname === '/api/ask') {
    return ask(req, res).catch(err => {
      console.error(err);
      if (!res.headersSent) res.statusCode = 500;
      res.end();
    });
  }
  let file = path.join(ROOT, decodeURIComponent(pathname));
  if (pathname.endsWith('/')) file = path.join(file, 'index.html');
  const rel = path.relative(ROOT, file);
  // nada fora da pasta, nem .env / node_modules
  if (rel.startsWith('..') || path.isAbsolute(rel) || /(^|[\\/])(\.|node_modules)/.test(rel)) {
    res.statusCode = 404;
    return res.end('404');
  }
  fs.readFile(file, (err, data) => {
    if (err) { res.statusCode = 404; return res.end('404'); }
    res.setHeader('Content-Type', TYPES[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => {
  const mode = process.env.ASK_MOCK === '1' ? 'modo simulado, sem chamadas à API'
    : process.env.ANTHROPIC_API_KEY ? `API ativa · modelo ${process.env.ASK_MODEL || 'claude-opus-5-5'}`
    : 'ANTHROPIC_API_KEY ausente: o terminal vai responder "não configurado"';
  console.log(`→ http://127.0.0.1:${PORT}  (${mode})`);
});
