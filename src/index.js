// Main entry point for the Orshot CLI
// This file can be used for programmatic access to the CLI functionality

const config = require('./config');
const api = require('./api');

module.exports = {
  config,
  api,
  version: require('../package.json').version,
};
