const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// load variables from .env
require('dotenv').config();

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
      { test: /\.jsx?$/, exclude: /node_modules/, loaders: [ 'babel-loader' ] },
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
        test: /.*\.(gif|png|jpe?g|svg)$/i,
        loaders: [
          'file-loader?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack-loader'
        ]
      }
    ]
  },
  plugins: [
    extractCss,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '\'' + process.env.NODE_ENV + '\'',
        API_BASE: '\'' + process.env.API_BASE + '\''
      }
    }),
    new webpack.LoaderOptionsPlugin({
      imageWebpackLoader: {
        mozjpeg: {
          quality: 65
        },
        pngquant: {
          quality: '65-90',
          speed: 4
        },
        svgo: {
          plugins: [
            { removeViewBox: false },
            { removeEmptyAttrs: true }
          ]
        }
      }
    })
  ]
};
