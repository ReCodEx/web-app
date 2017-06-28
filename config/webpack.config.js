const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// load variables from .env
require('dotenv').config();

// fix Widnows 10 Ubuntu issues with less loader:
try {
  require('os').networkInterfaces();
} catch (e) {
  require('os').networkInterfaces = () => ({});
}

const extractCss = new ExtractTextPlugin('style.css');

module.exports = {
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : 'none',
  entry: path.join(__dirname, '..', 'src/client.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '..', 'public'),
    publicPath: '/public/'
  },
  resolve: {
    alias: {
      moment: 'moment/moment.js'
    }
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loaders: ['babel-loader'] },
      { test: /\.json$/, loader: 'json-loader' },
      {
        test: /\.css$/,
        loader: extractCss.extract(['css-loader'])
      },
      {
        test: /\.less$/,
        loader: extractCss.extract(['css-loader?modules', 'less-loader'])
      },
      {
        test: /\.scss$/,
        loader: extractCss.extract(['css-loader?modules', 'sass-loader'])
      },
      {
        test: /.*\.(gif|png|jpe?g|svg)$/i,
        loaders: ['file-loader']
      }
    ]
  },
  plugins: [
    extractCss,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: "'" + process.env.NODE_ENV + "'",
        API_BASE: "'" + process.env.API_BASE + "'"
      }
    })
  ]
};
