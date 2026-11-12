const fs = require('fs');
const path = require('path');
const express = require('express');
const { attachApi } = require('./api/attach');

const app = express();
const port = process.env.PORT || 3000;
const buildDir = path.join(__dirname, 'build');
const indexPath = path.join(buildDir, 'index.html');

app.disable('x-powered-by');
attachApi(app);

app.use(express.static(buildDir, {
  index: false,
  maxAge: '1h',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

function publicConfig() {
  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY
    || process.env.REACT_APP_SUPABASE_ANON_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || '';
  return JSON.stringify({ supabaseUrl, supabaseKey }).replace(/</g, '\\u003c');
}

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'Introuvable.' });
  fs.readFile(indexPath, 'utf8', (error, html) => {
    if (error) return res.status(503).type('text').send('Le build du site est absent. Lancez npm run build.');
    const page = html.replace('<head>', `<head><script>window.__CAL_PUBLIC_CONFIG__=${publicConfig()};</script>`);
    res.setHeader('Cache-Control', 'no-cache');
    res.type('html').send(page);
  });
});

app.listen(port, () => {
  console.log(`CAL site listening on ${port}`);
});
