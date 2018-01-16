const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const GitRevisionPlugin = require('git-revision-webpack-plugin');

// load variables from .env
require('dotenv').config();

// fix Windows 10 and Ubuntu issues with less loader:
try {
  require('os').networkInterfaces();
} catch (e) {
  require('os').networkInterfaces = () => ({});
}

const extractCss = new ExtractTextPlugin('style-[contenthash].css');
const gitRevisionPlugin = new GitRevisionPlugin({
  versionCommand: 'describe --always --tags'
});

module.exports = {
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : 'none',
  entry: path.join(__dirname, '..', 'src/client.js'),
  output: {
    filename: 'bundle-[hash].js',
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
        API_BASE: "'" + process.env.API_BASE + "'",
        TITLE: "'" + process.env.TITLE + "'",
        SKIN: "'" + process.env.SKIN + "'",
        REDUX_DEV_SERVER_PORT: "'" + process.env.REDUX_DEV_SERVER_PORT + "'",
        ALLOW_NORMAL_REGISTRATION:
          "'" + process.env.ALLOW_NORMAL_REGISTRATION + "'",
        ALLOW_LDAP_REGISTRATION:
          "'" + process.env.ALLOW_LDAP_REGISTRATION + "'",
        ALLOW_CAS_REGISTRATION: "'" + process.env.ALLOW_CAS_REGISTRATION + "'",
        LOGGER_MIDDLEWARE_VERBOSE: "'" + process.env.LOGGER_MIDDLEWARE_VERBOSE + "'",
        LOGGER_MIDDLEWARE_EXCEPTIONS: "'" + process.env.LOGGER_MIDDLEWARE_EXCEPTIONS + "'",
      },
      gitRevision: {
        VERSION: JSON.stringify(gitRevisionPlugin.version()),
        COMMITHASH: JSON.stringify(gitRevisionPlugin.commithash()),
        BRANCH: JSON.stringify(gitRevisionPlugin.branch())
      }
    })
  ]
};
