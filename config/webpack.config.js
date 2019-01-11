const path = require('path');
const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const getVersion = () => {
  if (process.env.VERSION) {
    return JSON.stringify(process.env.VERSION);
  } else {
    const GitRevisionPlugin = require('git-revision-webpack-plugin');
    const gitRevisionPlugin = new GitRevisionPlugin({
      versionCommand: 'describe --always --tags'
    });
    return JSON.stringify(gitRevisionPlugin.version());
  }
};

// load variables from .env
require('dotenv').config();

// fix Windows 10 and Ubuntu issues with less loader:
try {
  require('os').networkInterfaces();
} catch (e) {
  require('os').networkInterfaces = () => ({});
}

const extractCss = new MiniCssExtractPlugin({
  filename: 'style-[contenthash].css'
});

module.exports = {
  entry: path.join(__dirname, '..', 'src/client.js'),
  output: {
    filename: 'bundle-[hash].js',
    path: path.join(__dirname, '..', 'public'),
    publicPath: '/public/'
  },
  mode: process.env.NODE_ENV,
  resolve: {
    alias: {
      moment: 'moment/moment.js'
    }
  },
  node: {
    fs: 'empty'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: /src/,
        use: ['babel-loader?cacheDirectory']
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.less$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader?modules', 'less-loader']
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader?modules', 'sass-loader']
      },
      {
        test: /.*\.(gif|png|jpe?g|svg)$/i,
        use: ['file-loader']
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true
      })
    ]
  },
  plugins: [
    extractCss,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: "'" + process.env.NODE_ENV + "'",
        LOGGER_MIDDLEWARE_VERBOSE:
          "'" + process.env.LOGGER_MIDDLEWARE_VERBOSE + "'",
        LOGGER_MIDDLEWARE_EXCEPTIONS:
          "'" + process.env.LOGGER_MIDDLEWARE_EXCEPTIONS + "'",
        VERSION: getVersion()
      }
    })
  ]
};
