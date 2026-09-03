const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

// Prevent unexpected process crashes
process.on('uncaughtException', (err) => {
  console.error('[SlipGaji] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[SlipGaji] Unhandled Rejection:', reason);
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
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.pdf': 'application/pdf',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Healthcheck endpoint for cPanel & monitoring
  if (pathname === '/api/health' || pathname === '/slipgaji_smpia9/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ status: 'ok', app: 'Slip Gaji SMPI Al Azhar 9' }));
    return;
  }

  // Strip possible subfolder prefix
  pathname = pathname.replace(/^\/slipgaji_smpia9/, '');
  if (!pathname || pathname === '/') {
    pathname = '/index.html';
  }

  // 1. Check for asset files
  const assetMatch = pathname.match(/(?:^|\/)(assets\/[^?#]+)/);
  if (assetMatch) {
    const assetSubPath = assetMatch[1];
    let candidatePath = path.join(PUBLIC_DIR, assetSubPath);

    // Smart fallback if an older hashed bundle is requested
    if (!fs.existsSync(candidatePath) && fs.existsSync(ASSETS_DIR)) {
      try {
        const files = fs.readdirSync(ASSETS_DIR);
        if (assetSubPath.endsWith('.js')) {
          const foundJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
          if (foundJs) candidatePath = path.join(ASSETS_DIR, foundJs);
        } else if (assetSubPath.endsWith('.css')) {
          const foundCss = files.find(f => f.startsWith('index-') && f.endsWith('.css'));
          if (foundCss) candidatePath = path.join(ASSETS_DIR, foundCss);
        }
      } catch (e) {
        // ignore
      }
    }

    if (fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
      const ext = path.extname(candidatePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      fs.createReadStream(candidatePath).pipe(res);
      return;
    }
  }

  // 2. Direct static files in root (e.g. favicon.ico, images)
  const directPath = path.join(PUBLIC_DIR, pathname);
  if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
    const ext = path.extname(directPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
    });
    fs.createReadStream(directPath).pipe(res);
    return;
  }

  // 3. SPA Fallback: Serve index.html
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(indexPath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end('<!doctype html><html><head><meta charset="utf-8"><title>Slip Gaji SMPI Al Azhar 9</title></head><body><h1>Slip Gaji SMPI Al Azhar 9</h1><p>Memuat aplikasi...</p></body></html>');
  }
});

// Phusion Passenger compatibility:
// If Passenger is loaded via socket, listen on Passenger socket, otherwise listen on PORT
if (typeof PhusionPassenger !== 'undefined') {
  server.listen('passenger');
} else {
  server.listen(PORT, () => {
    console.log(`Server Slip Gaji SMPI Al Azhar 9 berjalan di port ${PORT}`);
  });
}

module.exports = server;
