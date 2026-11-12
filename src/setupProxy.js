const { attachApi } = require('../api/attach');

module.exports = function setupProxy(app) {
  attachApi(app);
};
