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
    path.join(ROOT_DIR, 'dist', 'index.html')
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
    if (p.endsWith('/api/health')) {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      });
      res.end(JSON.stringify({ status: 'ok', node: process.version }));
      return;
    }

    // Trailing slash redirect for base path
    if (p.match(/^\/[^/.]+$/) && !p.endsWith('/')) {
      res.writeHead(301, { 'Location': p + '/' });
      res.end();
      return;
    }

    // Asset serving
    const fileName = path.basename(p);
    const ext = path.extname(fileName).toLowerCase();

    if (ext && ext !== '.html') {
      const filePath = findFile(ROOT_DIR, fileName);
      if (filePath && fs.existsSync(filePath)) {
        res.writeHead(200, {
          'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
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
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('index.html not found on server.');
      return;
    }

    let htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const realJsPath = findFile(ROOT_DIR, 'index-CLIyzC-A.js');
    const realCssPath = findFile(ROOT_DIR, 'index-TcQLEGr0.css');
    
    // Inject cache-busting timestamp so browser and proxy caches never serve stale/wrong MIME types
    const v = 'v=' + Date.now();
    if (realJsPath) {
      const jsName = path.basename(realJsPath);
      htmlContent = htmlContent.replace(/src=[\x27\x22]\.?\/assets\/[^\x27\x22]+\.js[^\x27\x22]*[\x27\x22]/, `src="./assets/${jsName}?${v}"`);
    }
    if (realCssPath) {
      const cssName = path.basename(realCssPath);
      htmlContent = htmlContent.replace(/href=[\x27\x22]\.?\/assets\/[^\x27\x22]+\.css[^\x27\x22]*[\x27\x22]/, `href="./assets/${cssName}?${v}"`);
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(htmlContent);
  } catch (err) {
    console.error('Request Error:', err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Server Error: ' + err.message);
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
