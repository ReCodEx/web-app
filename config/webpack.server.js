const path = require('path');

// load variables from .env
require('dotenv').config();

const clientConfig = require('./webpack.config.js');

module.exports = {
  entry: path.join(__dirname, '..', 'src/server.js'),
  output: {
    filename: 'server.js',
    path: path.join(__dirname, '..', 'bin'),
  },
  resolve: {
    alias: {
      moment: 'moment/moment.js',
    },
  },
  optimization: clientConfig.optimization,
  target: 'node',
  mode: process.env.NODE_ENV,
  module: clientConfig.module,
  plugins: clientConfig.plugins,
};
