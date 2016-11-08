const path = require('path');
const webpack = require('webpack');
const fs = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
  resolve: {
    alias: {
      moment: 'moment/moment.js'
    }
  },
  module: clientConfig.module,
  externals: nodeModules,
  plugins: [
    new ExtractTextPlugin('style.css'),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '\'production\'',
        API_BASE: '\'' + process.env.API_BASE + '\''
      }
    })
  ]
};
