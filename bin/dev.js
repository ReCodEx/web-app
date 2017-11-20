import React from 'react';
import Express from 'express';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import path from 'path';
import config from '../config/webpack.config';
import colors from 'colors';
import remotedev from 'remotedev-server';

const PORT = process.env.PORT || 8080;
const WEBPACK_DEV_SERVER_PORT = process.env.WEBPACK_DEV_SERVER_PORT || 8081;
const REDUX_DEV_SERVER_PORT = process.env.REDUX_DEV_SERVER_PORT || 8082;

let app = new Express();
app.set('view engine', 'ejs');
app.use(Express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.render('index', {
    html: '',
    head: {
      htmlAttributes: 'lang="cs"',
      title: '<title>ReCodEx</title>',
      meta: '',
      link: ''
    },
    reduxState: undefined,
    style: `http://localhost:${WEBPACK_DEV_SERVER_PORT}/style.css`,
    bundle: `http://localhost:${WEBPACK_DEV_SERVER_PORT}/bundle.js`
  });
});

var server = new WebpackDevServer(webpack(config), {
  contentBase: path.join(__dirname, '..', 'public'),
  hot: true,
  quiet: false,
  noInfo: false,
  publicPath: '/',
  stats: { colors: true }
});

remotedev({
  hostname: '127.0.0.1',
  port: REDUX_DEV_SERVER_PORT
});

server.listen(WEBPACK_DEV_SERVER_PORT, 'localhost', () => {
  console.log(
    `${colors.yellow('WebpackDevServer')} is running on ${colors.underline(
      `http://localhost:${WEBPACK_DEV_SERVER_PORT}`
    )}`
  );
});

app.listen(PORT, () => {
  console.log(
    `${colors.green('WebApp')} is running on ${colors.underline(
      `http://localhost:${PORT}`
    )}`
  );
});
