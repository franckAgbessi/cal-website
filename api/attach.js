const express = require('express');
const articles = require('./articles');
const officialArticles = require('./official-articles');

function attachApi(app) {
  app.use('/api', express.json({ limit: '8mb' }));
  app.post('/api/articles', articles);
  app.get('/api/official-articles', officialArticles);
}

module.exports = { attachApi };
