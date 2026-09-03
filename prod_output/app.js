const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
};

function findFile(startDir, targetName) {
  const isTargetJs = targetName.endsWith('.js') && (targetName.startsWith('index-') || targetName.includes('index'));
  const isTargetCss = targetName.endsWith('.css');

  function scan(dir) {
    if (!fs.existsSync(dir)) return null;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isDirectory() && e.name === targetName) {
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
  const parsed = new URL(req.url || '/', 'http://localhost');
  let p = decodeURIComponent(parsed.pathname);

  // Health endpoint
  if (p.endsWith('/api/health')) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  // Receive missing asset files via binary stream directly
  if (p.endsWith('/api/sync-asset')) {
    const fileName = path.basename(parsed.searchParams.get('file') || 'index-CLIyzC-A.js');
    const targetDir = path.join(ROOT_DIR, 'assets');
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const targetFile = path.join(targetDir, fileName);
    const writeStream = fs.createWriteStream(targetFile);
    req.pipe(writeStream);
    writeStream.on('finish', () => {
      const sz = fs.statSync(targetFile).size;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, file: fileName, size: sz }));
    });
    writeStream.on('error', (err) => {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    });
    return;
  }

  // Diagnostics & Status Page
  if (p.endsWith('/sync') || p.endsWith('/status')) {
    const jsPath = findFile(ROOT_DIR, 'index-CLIyzC-A.js');
    const cssPath = findFile(ROOT_DIR, 'index-TcQLEGr0.css');
    const purifyPath = findFile(ROOT_DIR, 'purify.es-CYR4BTuT.js');
    const htmlPath = findIndexHtml();

    const statusHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Status Deployment - Slip Gaji SMPI Al Azhar 9</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; color: #1e293b; padding: 24px; }
    .card { background: white; max-width: 600px; margin: 0 auto; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    h1 { font-size: 1.25rem; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
    .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
    .ok { color: #16a34a; font-weight: 600; }
    .missing { color: #dc2626; font-weight: 600; }
    .btn { display: inline-block; margin-top: 20px; background: #2563eb; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>📊 Status File Aplikasi Slip Gaji</h1>
    <div class="item"><span>index.html</span><span class="${htmlPath ? 'ok' : 'missing'}">${htmlPath ? '✅ Siap' : '❌ Hilang'}</span></div>
    <div class="item"><span>index-CLIyzC-A.js (Core JS)</span><span class="${jsPath ? 'ok' : 'missing'}">${jsPath ? '✅ Siap (' + Math.round(fs.statSync(jsPath).size/1024) + ' KB)' : '❌ Belum Ada'}</span></div>
    <div class="item"><span>index-TcQLEGr0.css (Styling)</span><span class="${cssPath ? 'ok' : 'missing'}">${cssPath ? '✅ Siap (' + Math.round(fs.statSync(cssPath).size/1024) + ' KB)' : '❌ Belum Ada'}</span></div>
    <div class="item"><span>purify.es-CYR4BTuT.js</span><span class="${purifyPath ? 'ok' : 'missing'}">${purifyPath ? '✅ Siap' : '❌ Belum Ada'}</span></div>
    <div style="margin-top:20px; font-size: 13px; color: #64748b;">
      ${jsPath ? '🎉 Semua file sudah lengkap! Anda bisa langsung membuka aplikasi.' : '⚠️ File JavaScript utama belum terpasang di folder assets.'}
    </div>
    <a class="btn" href="./">Buka Aplikasi Slip Gaji</a>
  </div>
</body>
</html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
    res.end(statusHtml);
    return;
  }

  // Trailing slash redirect for base path
  if (p.match(/^\/[^/.]+$/) && !p.endsWith('/')) {
    res.writeHead(301, { 'Location': p + '/' });
    res.end();
    return;
  }

  // Check if requesting an asset
  const fileName = path.basename(p);
  const ext = path.extname(fileName).toLowerCase();

  if (ext && ext !== '.html') {
    const filePath = findFile(ROOT_DIR, fileName);
    if (filePath) {
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
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
  if (realJsPath) {
    const jsName = path.basename(realJsPath);
    htmlContent = htmlContent.replace(/src=[\x27\x22]\.\/assets\/[^\x27\x22]+\.js[\x27\x22]/, `src="./assets/${jsName}"`);
  }
  if (realCssPath) {
    const cssName = path.basename(realCssPath);
    htmlContent = htmlContent.replace(/href=[\x27\x22]\.\/assets\/[^\x27\x22]+\.css[\x27\x22]/, `href="./assets/${cssName}"`);
  }

  res.writeHead(200, {
    'Content-Type': 'text/html; charset=UTF-8',
    'Cache-Control': 'no-cache'
  });
  res.end(htmlContent);
});

if (typeof PhusionPassenger !== 'undefined') {
  server.listen('passenger');
} else {
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
