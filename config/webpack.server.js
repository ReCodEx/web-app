const path = require('path');
const fs = require('fs');

// load variables from .env
require('dotenv').config();

const clientConfig = require('./webpack.config.js');

var nodeModules = {};
fs
  .readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  entry: path.join(__dirname, '..', 'src/server.js'),
  output: {
    filename: 'server.js',
    path: path.join(__dirname, '..', 'bin')
  },
  resolve: {
    alias: {
      moment: 'moment/moment.js'
    }
  },
  module: clientConfig.module,
  externals: nodeModules,
  plugins: clientConfig.plugins
};
