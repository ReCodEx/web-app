import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { GitRevisionPlugin } from 'git-revision-webpack-plugin';
import dotenv from 'dotenv';
import os from 'os';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// load variables from .env
dotenv.config();

// fix Windows 10 and Ubuntu issues with less loader:
try {
  os.networkInterfaces();
} catch (e) {
  os.networkInterfaces = () => ({});
}

const extractCss = new MiniCssExtractPlugin({ filename: 'style.css' });
const gitRevisionPlugin = new GitRevisionPlugin({
  versionCommand: 'describe --always --tags',
});

export default {
  // switch the source map generation when debugging
  // note, we used 'eval-source-map' before, but since webpack 5.100, it breaks the build
  // (causes 'SyntaxError: redeclaration of function normalize')
  devtool: 'inline-source-map',
  //devtool: false, // turn it off completely

  entry: path.join(__dirname, '..', 'src/client.js'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, '..', 'public'),
    publicPath: '/public/',
  },
  mode: process.env.NODE_ENV,
  resolve: {
    alias: {
      moment: 'moment/moment.js',
    },
    fallback: { fs: false },
    mainFiles: ['index'],
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        exclude: /node_modules/,
        include: /src/,
        use: ['babel-loader?cacheDirectory'],
        type: 'javascript/auto', // this fixes CJS module import
        resolve: {
          fullySpecified: false, // this is required to handle dir imports (without /index.js)
        },
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: { modules: true },
          },
          'less-loader',
        ],
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
