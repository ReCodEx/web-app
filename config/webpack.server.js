import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import clientConfig from './webpack.config.js';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

// load variables from .env
dotenv.config();

export default {
  entry: path.join(__dirname, '..', 'src/server.js'),
  output: {
    filename: 'server.mjs',
    path: path.join(__dirname, '..', 'bin'),
    chunkFormat: 'module',
  },
  experiments: {
    outputModule: true,
  },
  resolve: {
    alias: {
      moment: 'moment/moment.js',
      'react-ace': 'react-ace-bad', // a hack to rid ourselves of ace module in server mode
    },
    fallback: { 'react-ace-bad': false },
  },
  target: 'node',
  mode: process.env.NODE_ENV,
  module: clientConfig.module,
  optimization: clientConfig.optimization,
  plugins: clientConfig.plugins,
};
