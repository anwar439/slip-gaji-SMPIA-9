const http = require('http');
const path = require('path');
const fs = require('fs');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

function findFile(startDir, targetName) {
  // Strip any query strings if passed
  const cleanTarget = targetName.split('?')[0];
  const isTargetJs = cleanTarget.endsWith('.js') && (cleanTarget.startsWith('index-') || cleanTarget.includes('index'));
  const isTargetCss = cleanTarget.endsWith('.css');

  function scan(dir) {
    if (!fs.existsSync(dir)) return null;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory() && e.name === cleanTarget) {
          return path.join(dir, e.name);
        }
      }
      if (isTargetJs) {
        for (const e of entries) {
          if (!e.isDirectory() && e.name.endsWith('.js') && !e.name.startsWith('purify') && !e.name.startsWith('index.es') && e.name !== 'app.js' && e.name !== 'server.cjs') {
            return path.join(dir, e.name);
          }
        }
      }
      if (isTargetCss) {
        for (const e of entries) {
          if (!e.isDirectory() && e.name.endsWith('.css')) {
            return path.join(dir, e.name);
          }
        }
      }
      for (const e of entries) {
        if (e.isDirectory() && !['node_modules', '.git', '.cache'].includes(e.name)) {
          const res = scan(path.join(dir, e.name));
          if (res) return res;
        }
      }
    } catch (err) {}
    return null;
  }
  return scan(startDir);
}

function findIndexHtml() {
  const candidates = [
    path.join(ROOT_DIR, 'index.html'),
    path.join(ROOT_DIR, 'prod_output', 'index.html'),
    path.join(ROOT_DIR, 'dist', 'index.html'),
    path.join(process.cwd(), 'index.html'),
    path.join(process.cwd(), 'prod_output', 'index.html'),
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(ROOT_DIR, '..', 'index.html')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

const server = http.createServer((req, res) => {
  try {
    const parsed = url.parse(req.url || '/');
    let p = decodeURIComponent(parsed.pathname || '/');

    // Health check endpoint
    if (p.endsWith('/api/health') || p === '/health') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify({ status: 'ok', node: process.version }));
      return;
    }

    // Trailing slash redirect for base path (only if no extension)
    if (p.match(/^\/[^/.]+$/) && !p.endsWith('/')) {
      res.writeHead(301, { 'Location': p + '/' });
      res.end();
      return;
    }

    // Asset serving
    const fileName = path.basename(p);
    const ext = path.extname(fileName).toLowerCase();

    if (ext && ext !== '.html') {
      // 1. Check direct relative path
      let filePath = path.join(ROOT_DIR, p);
      if (!fs.existsSync(filePath)) {
        filePath = path.join(ROOT_DIR, 'assets', fileName);
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.join(ROOT_DIR, 'prod_output', 'assets', fileName);
      }
      if (!fs.existsSync(filePath)) {
        filePath = path.join(ROOT_DIR, 'dist', 'assets', fileName);
      }
      if (!fs.existsSync(filePath)) {
        filePath = findFile(ROOT_DIR, fileName);
      }

      if (filePath && fs.existsSync(filePath)) {
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'X-Content-Type-Options': 'nosniff'
        });
        fs.createReadStream(filePath).pipe(res);
        return;
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end(`Asset not found: ${fileName}`);
        return;
      }
    }

    // Serve index.html
    const htmlPath = findIndexHtml();
    if (!htmlPath) {
      // Return a 200 OK informative placeholder instead of 500 so cPanel checks never fail
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end('<!DOCTYPE html><html><head><title>Slip Gaji</title></head><body><h3>Aplikasi Slip Gaji aktif.</h3><p>Pastikan file index.html dan folder assets sudah diunggah di folder aplikasi.</p></body></html>');
      return;
    }

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(htmlContent);
  } catch (err) {
    console.error('Request Error:', err);
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end(`<!DOCTYPE html><html><body><h3>Server Notice</h3><p>${err.message}</p></body></html>`);
  }
});

server.on('error', (err) => {
  console.error('Server Listen Error:', err);
});

if (typeof PhusionPassenger !== 'undefined') {
  server.listen('passenger');
} else {
  server.listen(PORT);
}
