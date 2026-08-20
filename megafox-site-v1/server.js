'use strict';

const http = require('http');
const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'leads.jsonl');
const MAX_BODY = 20 * 1024;
const RATE_WINDOW = 15 * 60 * 1000;
const RATE_MAX = 5;
const rate = new Map();

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8', '.xml': 'application/xml; charset=utf-8'
};

function securityHeaders(res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; media-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'");
}

function sendJson(res, code, payload) {
  securityHeaders(res);
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function clientIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

function rateLimited(ip) {
  const now = Date.now();
  const entries = (rate.get(ip) || []).filter(ts => now - ts < RATE_WINDOW);
  if (entries.length >= RATE_MAX) { rate.set(ip, entries); return true; }
  entries.push(now); rate.set(ip, entries); return false;
}

function clean(value, max = 200) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max);
}

function validEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email); }

async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0, data = '';
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) { reject(Object.assign(new Error('Payload too large'), { code: 413 })); req.destroy(); return; }
      data += chunk;
    });
    req.on('end', () => {
      try { resolve(JSON.parse(data || '{}')); } catch { reject(Object.assign(new Error('JSON inválido'), { code: 400 })); }
    });
    req.on('error', reject);
  });
}

async function handleContact(req, res) {
  const ip = clientIp(req);
  if (rateLimited(ip)) return sendJson(res, 429, { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' });

  try {
    const body = await readJsonBody(req);
    if (clean(body.website, 200)) return sendJson(res, 200, { ok: true }); // honeypot

    const lead = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      name: clean(body.name, 100), company: clean(body.company, 120), phone: clean(body.phone, 30),
      email: clean(body.email, 140).toLowerCase(), interest: clean(body.interest, 50), message: clean(body.message, 1000)
    };

    if (lead.name.length < 2) return sendJson(res, 422, { error: 'Informe seu nome.' });
    if (lead.phone.length < 8) return sendJson(res, 422, { error: 'Informe um telefone válido.' });
    if (!validEmail(lead.email)) return sendJson(res, 422, { error: 'Informe um e-mail válido.' });

    await fsp.mkdir(DATA_DIR, { recursive: true });
    await fsp.appendFile(LEADS_FILE, JSON.stringify(lead) + '\n', { mode: 0o600 });
    return sendJson(res, 201, { ok: true, id: lead.id });
  } catch (error) {
    return sendJson(res, error.code || 500, { error: error.code ? error.message : 'Erro interno ao processar o contato.' });
  }
}

async function serveStatic(req, res) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname); }
  catch { return sendJson(res, 400, { error: 'URL inválida.' }); }
  if (pathname === '/') pathname = '/index.html';

  const resolved = path.resolve(PUBLIC_DIR, '.' + pathname);
  if (!resolved.startsWith(PUBLIC_DIR + path.sep) && resolved !== path.join(PUBLIC_DIR, 'index.html')) return sendJson(res, 403, { error: 'Acesso negado.' });

  try {
    const stat = await fsp.stat(resolved);
    if (!stat.isFile()) throw new Error('Not file');
    securityHeaders(res);
    const ext = path.extname(resolved).toLowerCase();
    const cache = /\.(?:jpg|jpeg|png|webp|mp4|css|js)$/.test(ext) ? 'public, max-age=604800' : 'no-cache';
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': cache });
    fs.createReadStream(resolved).pipe(res);
  } catch { sendJson(res, 404, { error: 'Recurso não encontrado.' }); }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && req.url.startsWith('/api/health')) return sendJson(res, 200, { ok: true, service: 'megafox-site', time: new Date().toISOString() });
  if (req.method === 'POST' && req.url.startsWith('/api/contact')) return handleContact(req, res);
  if (req.method !== 'GET' && req.method !== 'HEAD') return sendJson(res, 405, { error: 'Método não permitido.' });
  return serveStatic(req, res);
});

server.listen(PORT, HOST, () => console.log(`MegaFox site: http://localhost:${PORT}`));
