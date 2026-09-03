const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

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

// Smart directory resolver: finds compiled files whether app.js is in root or inside prod_output
function findCompiledIndexHtml() {
  const candidates = [
    path.join(ROOT_DIR, 'prod_output', 'index.html'),
    path.join(ROOT_DIR, 'dist', 'index.html'),
    path.join(ROOT_DIR, 'index.html')
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      try {
        const content = fs.readFileSync(candidate, 'utf8');
        // Do NOT serve uncompiled source files that contain /src/main.tsx
        if (!content.includes('/src/main.tsx')) {
          return candidate;
        }
      } catch (e) {
        // ignore
      }
    }
  }
  // Fallback to direct index.html if no compiled version found
  return path.join(ROOT_DIR, 'index.html');
}

function findAssetFile(assetFileName) {
  // Candidate search directories in priority order
  const searchDirs = [
    path.join(ROOT_DIR, 'assets'),
    path.join(ROOT_DIR, 'prod_output', 'assets'),
    path.join(ROOT_DIR, 'dist', 'assets'),
    ROOT_DIR,
    path.join(ROOT_DIR, 'prod_output'),
    path.join(ROOT_DIR, 'dist')
  ];

  // 1. Direct exact filename match
  for (const dir of searchDirs) {
    const candidate = path.join(dir, assetFileName);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  // 2. Fallback for cached/renamed index bundles (e.g. index-*.js or index-*.css)
  for (const dir of searchDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      try {
        const files = fs.readdirSync(dir);
        if (assetFileName.endsWith('.js')) {
          const matched = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
          if (matched) return path.join(dir, matched);
        } else if (assetFileName.endsWith('.css')) {
          const matched = files.find(f => f.startsWith('index-') && f.endsWith('.css'));
          if (matched) return path.join(dir, matched);
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return null;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url || '/', 'http://localhost');
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Healthcheck endpoint for cPanel Phusion Passenger & monitoring
  if (pathname === '/api/health' || pathname.endsWith('/api/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8' });
    res.end(JSON.stringify({ status: 'ok', app: 'Slip Gaji SMPI Al Azhar 9' }));
    return;
  }

  // Handle URL without trailing slash (e.g. /slipgaji_smpia9 -> /slipgaji_smpia9/)
  if (pathname.match(/^\/[^/.]+$/) && !pathname.endsWith('/')) {
    res.writeHead(301, { 'Location': pathname + '/' });
    res.end();
    return;
  }

  // Strip subfolder prefix if present (e.g. /slipgaji_smpia9/...)
  pathname = pathname.replace(/^\/[^/.]+/, '');
  if (!pathname || pathname === '/') {
    pathname = '/index.html';
  }

  // 1. Check for asset files (assets/...)
  const assetMatch = pathname.match(/(?:^|\/)(?:assets\/)?([^/]+\.(?:js|mjs|css|png|jpg|jpeg|svg|woff|woff2|ttf|ico|pdf|xlsx))$/i);
  if (assetMatch) {
    const assetFileName = assetMatch[1];
    const resolvedAssetPath = findAssetFile(assetFileName);

    if (resolvedAssetPath) {
      const ext = path.extname(resolvedAssetPath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      fs.createReadStream(resolvedAssetPath).pipe(res);
      return;
    }
  }

  // 2. Direct physical static file in ROOT_DIR or prod_output
  const directCandidates = [
    path.join(ROOT_DIR, pathname),
    path.join(ROOT_DIR, 'prod_output', pathname),
    path.join(ROOT_DIR, 'dist', pathname)
  ];
  for (const directPath of directCandidates) {
    if (fs.existsSync(directPath) && fs.statSync(directPath).isFile()) {
      const ext = path.extname(directPath).toLowerCase();
      // If it's an index.html, ensure it is the compiled one
      if (ext === '.html') {
        const content = fs.readFileSync(directPath, 'utf8');
        if (content.includes('/src/main.tsx')) {
          continue; // Skip uncompiled source
        }
      }
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=86400'
      });
      fs.createReadStream(directPath).pipe(res);
      return;
    }
  }

  // 3. SPA Fallback: Serve the compiled index.html
  const indexPath = findCompiledIndexHtml();
  if (fs.existsSync(indexPath)) {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=UTF-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(indexPath).pipe(res);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end('<!doctype html><html><head><meta charset="utf-8"><title>Slip Gaji SMPI Al Azhar 9</title></head><body><h1>Slip Gaji SMPI Al Azhar 9</h1><p>Memuat aplikasi...</p></body></html>');
  }
});

// Phusion Passenger compatibility:
if (typeof PhusionPassenger !== 'undefined') {
  server.listen('passenger');
} else {
  server.listen(PORT, () => {
    console.log(`Server Slip Gaji SMPI Al Azhar 9 berjalan di port ${PORT}`);
  });
}

module.exports = server;
