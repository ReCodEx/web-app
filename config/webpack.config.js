const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const strip = require('strip-loader');

// load variables from .env
require('dotenv').config();

module.exports = {
  devtool: 'source-map',
  entry: path.join(__dirname, '..', 'src/client.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '..', 'public'),
    publicPath: '/public/'
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loaders: [ 'babel' ] },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loaders: [ 'style', 'css' ] }
    ]
  },
  resolve: {
    extensions: [ '', '.js', '.json' ]
  },
  postcss: [
    autoprefixer({ browsers: ['last 2 versions'] })
  ],
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '\'' + process.env.NODE_ENV + '\'',
        API_BASE: '\'' + process.env.API_BASE + '\''
      }
    })
  ]
};
