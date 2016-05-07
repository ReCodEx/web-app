import React from 'react';
import Express from 'express';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import path from 'path';
import config from './webpack.config';

let app = new Express();
app.set('view engine', 'ejs');
app.use(Express.static('public'));

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
    bundle: 'http://localhost:8081/bundle.js'
  });
});

var server = new WebpackDevServer(webpack(config), {
  contentBase: path.join(__dirname, 'public'),
  hot: true,
  quiet: false,
  noInfo: false,
  publicPath: '/',
  stats: { colors: true }
});

server.listen(8081, 'localhost', () => {
  console.log('Webpack is running on port 8081');
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
