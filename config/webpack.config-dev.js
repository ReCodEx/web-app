const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { GitRevisionPlugin } = require('git-revision-webpack-plugin');

// load variables from .env
require('dotenv').config();

// fix Windows 10 and Ubuntu issues with less loader:
try {
  require('os').networkInterfaces();
} catch (e) {
  require('os').networkInterfaces = () => ({});
}

const extractCss = new MiniCssExtractPlugin({ filename: 'style.css' });
const gitRevisionPlugin = new GitRevisionPlugin({
  versionCommand: 'describe --always --tags',
});

module.exports = {
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : 'none',
  entry: path.join(__dirname, '..', 'src/client.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '..', 'public'),
    publicPath: '/public/',
  },
  mode: 'development',
  resolve: {
    alias: {
      moment: 'moment/moment.js',
    },
    fallback: { fs: false },
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: /src/,
        use: ['babel-loader?cacheDirectory'],
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader?modules', 'less-loader'],
      },
      {
        test: /.*\.(gif|png|jpe?g|svg)$/i,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    extractCss,
    new webpack.DefinePlugin({
      'process.env.LOGGER_MIDDLEWARE_VERBOSE': JSON.stringify(process.env.LOGGER_MIDDLEWARE_VERBOSE),
      'process.env.LOGGER_MIDDLEWARE_EXCEPTIONS': JSON.stringify(process.env.LOGGER_MIDDLEWARE_EXCEPTIONS),
      'process.env.VERSION': JSON.stringify(gitRevisionPlugin.version()),
      'process.env.REDUX_DEV_SERVER_PORT': JSON.stringify(process.env.REDUX_DEV_SERVER_PORT),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
    }),
  ],
};
