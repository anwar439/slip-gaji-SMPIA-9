const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Auto-redirect /slipgaji_smpia9 to /slipgaji_smpia9/ (with trailing slash)
// This ensures browser relative asset paths like ./assets/index.js resolve correctly
app.use((req, res, next) => {
  const urlPath = req.path || req.url;
  if (urlPath === '/slipgaji_smpia9' && !req.originalUrl.endsWith('/')) {
    return res.redirect(301, '/slipgaji_smpia9/');
  }
  next();
});

// 2. Serve static files from root and subpath
app.use(express.static(__dirname));
app.use('/slipgaji_smpia9', express.static(__dirname));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/slipgaji_smpia9/assets', express.static(path.join(__dirname, 'assets')));

// 3. API health endpoint
app.get(['/api/health', '/slipgaji_smpia9/api/health'], (req, res) => {
  res.json({ status: 'ok', app: 'slip gaji id SMPI Al Azhar 9' });
});

// 4. SPA fallback: Send index.html for page routes
app.get('*', (req, res) => {
  const cleanPath = (req.path || '').replace(/^\/slipgaji_smpia9/, '');
  
  // Check if requesting an asset file directly
  if (cleanPath.startsWith('/assets/') || cleanPath.endsWith('.js') || cleanPath.endsWith('.css') || cleanPath.endsWith('.svg') || cleanPath.endsWith('.png') || cleanPath.endsWith('.jpg')) {
    const assetFile = path.join(__dirname, cleanPath);
    if (fs.existsSync(assetFile)) {
      return res.sendFile(assetFile);
    }
    return res.status(404).send('Asset not found');
  }

  // Otherwise serve SPA index.html
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server slip gaji SMPI Al Azhar 9 is running on port ${PORT}`);
});

module.exports = app;

