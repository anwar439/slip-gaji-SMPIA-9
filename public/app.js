const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Set root directory
const PUBLIC_DIR = __dirname;
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

// Disable x-powered-by
app.disable('x-powered-by');

// Healthcheck endpoint for cPanel
app.get(['/api/health', '/slipgaji_smpia9/api/health'], (req, res) => {
  res.status(200).json({ status: 'ok', app: 'slip gaji id SMPI Al Azhar 9' });
});

// Explicit Static Asset Handler
app.use((req, res, next) => {
  const reqPath = req.path || req.url || '';
  
  // 1. Match any request to /assets/... or /slipgaji_smpia9/assets/...
  const assetMatch = reqPath.match(/(?:^|\/)(assets\/[^?#]+)/);
  if (assetMatch) {
    const assetSubPath = assetMatch[1]; // e.g. "assets/index-90AFLiRH.js"
    let filePath = path.join(PUBLIC_DIR, assetSubPath);

    // If exact file does not exist (e.g. old cached bundle name index-Bqw-iHtW.js requested)
    if (!fs.existsSync(filePath) && fs.existsSync(ASSETS_DIR)) {
      const files = fs.readdirSync(ASSETS_DIR);
      if (assetSubPath.endsWith('.js')) {
        const foundJs = files.find(f => f.startsWith('index-') && f.endsWith('.js'));
        if (foundJs) filePath = path.join(ASSETS_DIR, foundJs);
      } else if (assetSubPath.endsWith('.css')) {
        const foundCss = files.find(f => f.startsWith('index-') && f.endsWith('.css'));
        if (foundCss) filePath = path.join(ASSETS_DIR, foundCss);
      }
    }

    if (fs.existsSync(filePath)) {
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.ico')) {
        res.setHeader('Content-Type', 'image/x-icon');
      }
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.sendFile(filePath);
    }
  }

  // 2. Direct static files in root (favicon.ico, manifest, etc.)
  const cleanPath = reqPath.replace(/^\/slipgaji_smpia9/, '').replace(/^\//, '');
  if (cleanPath && cleanPath !== 'index.html') {
    const directFile = path.join(PUBLIC_DIR, cleanPath);
    if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
      return res.sendFile(directFile);
    }
  }

  next();
});

// Serve standard express static
app.use(express.static(PUBLIC_DIR));
app.use('/slipgaji_smpia9', express.static(PUBLIC_DIR));

// Fallback: Send index.html with UTF-8 charset
app.use((req, res) => {
  const indexPath = path.join(PUBLIC_DIR, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.status(200).sendFile(indexPath);
  } else {
    res.status(200).send('<!doctype html><html><body><h1>Slip Gaji SMPI Al Azhar 9</h1><p>Memuat aplikasi...</p></body></html>');
  }
});

// Listen on Passenger socket or standalone port
if (typeof(PhusionPassenger) !== 'undefined') {
  app.listen('passenger');
} else {
  app.listen(PORT, () => {
    console.log(`Server Slip Gaji SMPI Al Azhar 9 berjalan di port ${PORT}`);
  });
}

module.exports = app;
