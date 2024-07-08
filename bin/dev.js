import Express from 'express';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import path from 'path';
import { fileURLToPath } from 'url';
import config from '../config/webpack.config-dev.js';
import colors from 'colors';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const WEBPACK_DEV_SERVER_PORT = process.env.WEBPACK_DEV_SERVER_PORT || 8081;
const fileConfig = fs.readFileSync('etc/env.json', 'utf8');
const parsedConfig = JSON.parse(fileConfig);
const PORT = parsedConfig.PORT;
const SKIN = parsedConfig.SKIN;
const urlPrefix = parsedConfig.URL_PATH_PREFIX || '';

const app = new Express();
app.set('view engine', 'ejs');
app.use(urlPrefix, Express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.render('index', {
    html: '',
    head: {
      htmlAttributes: 'lang="cs"',
      title: '<title>ReCodEx</title>',
      meta: '',
      link: '',
    },
    reduxState: undefined,
    skin: SKIN,
    style: `http://localhost:${WEBPACK_DEV_SERVER_PORT}/style.css`,
    bundle: `http://localhost:${WEBPACK_DEV_SERVER_PORT}/bundle.js`,
    config: fileConfig,
    urlPrefix,
  });
});

const server = new WebpackDevServer(
  {
    static: {
      directory: path.join(__dirname, '..', 'public'),
    },
    hot: true,
    host: 'localhost',
    port: WEBPACK_DEV_SERVER_PORT,
    devMiddleware: {
      stats: { colors: true },
      publicPath: '/',
    },
  },
  webpack(config)
);

(async () => {
  await server.start();
  console.log(
    `${colors.yellow('WebpackDevServer')} is running on ${colors.underline(
      `http://localhost:${WEBPACK_DEV_SERVER_PORT}`
    )}`
  );
})();
/*
server.listen(WEBPACK_DEV_SERVER_PORT, 'localhost', () => {
  console.log(
    `${colors.yellow('WebpackDevServer')} is running on ${colors.underline(
      `http://localhost:${WEBPACK_DEV_SERVER_PORT}`
    )}`
  );
});
*/
app.listen(PORT, () => {
  console.log(`${colors.green('WebApp')} is running on ${colors.underline(`http://localhost:${PORT}`)}`);
});
