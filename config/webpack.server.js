const path = require('path');
const webpack = require('webpack');
const strip = require('strip-loader');
const autoprefixer = require('autoprefixer');
const fs = require('fs');

// load variables from .env
require('dotenv').config();

const clientConfig = require('./webpack.config.js');

var nodeModules = {};
fs.readdirSync('node_modules')
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
  module: clientConfig.module,
  externals: nodeModules,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '\'production\'',
        API_BASE: '\'' + process.env.API_BASE + '\''
      }
    })
  ]
};
