import path from 'path';
import { fileURLToPath } from 'url';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { GitRevisionPlugin } from 'git-revision-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import dotenv from 'dotenv';
import os from 'os';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const getVersion = () => {
  if (process.env.VERSION) {
    return JSON.stringify(process.env.VERSION);
  } else {
    const gitRevisionPlugin = new GitRevisionPlugin({
      versionCommand: 'describe --always --tags',
    });
    return JSON.stringify(gitRevisionPlugin.version());
  }
};

// load variables from .env
dotenv.config();

// fix Windows 10 and Ubuntu issues with less loader:
try {
  os.networkInterfaces();
} catch (e) {
  os.networkInterfaces = () => ({});
}

const extractCss = new MiniCssExtractPlugin({
  filename: 'style-[contenthash].css',
});

export default {
  entry: path.join(__dirname, '..', 'src/client.js'),
  output: {
    filename: 'bundle-[contenthash].js',
    path: path.join(__dirname, '..', 'public'),
    publicPath: '/public/',
  },
  mode: process.env.NODE_ENV,
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
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false,
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
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
    ],
  },
  plugins: [
    extractCss,
    new webpack.DefinePlugin({
      'process.env.LOGGER_MIDDLEWARE_VERBOSE': JSON.stringify(process.env.LOGGER_MIDDLEWARE_VERBOSE),
      'process.env.LOGGER_MIDDLEWARE_EXCEPTIONS': JSON.stringify(process.env.LOGGER_MIDDLEWARE_EXCEPTIONS),
      'process.env.VERSION': getVersion(),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }),
  ],
};
