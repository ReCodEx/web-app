const path = require('path');
const webpack = require('webpack');
const strip = require('strip-loader');
const autoprefixer = require('autoprefixer');
const fs = require('fs');

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
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /node_modules/, loaders: [ 'babel' ] },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.css$/, loader: 'style!css?modules&importLoaders=2&sourceMap!autoprefixer?browsers=last 2 version' },
      { test: /\.less$/, loader: 'style!css?modules&importLoaders=2&sourceMap!autoprefixer?browsers=last 2 version!less?outputStyle=expanded&sourceMap=true&sourceMapContents=true' },
      { test: /\.scss$/, loader: 'style!css?modules&importLoaders=2&sourceMap!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded&sourceMap=true&sourceMapContents=true' },
      { test: /\.woff(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/font-woff' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=application/octet-stream' },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: 'file' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: 'url?limit=10000&mimetype=image/svg+xml' },
      { test: /\.(jpg|png|gif)/, loader: 'url-loader?limit=10240' }
    ]
  },
  postcss: [
    autoprefixer({ browsers: ['last 2 versions'] })
  ],
  externals: nodeModules,
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '\'' + process.env.NODE_ENV + '\'',
        API_BASE: '\'' + process.env.API_BASE + '\''
      }
    })
  ]
};
