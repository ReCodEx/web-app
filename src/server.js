// necessary polyfill for both browser and server
import 'isomorphic-fetch';

// server setup
import React from 'react';
import { Provider } from 'react-redux';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';
import Express from 'express';
import Promise from 'bluebird';
import Helmet from 'react-helmet';
import cookieParser from 'cookie-parser';
import fs from 'fs';

import { StaticRouter } from 'react-router';

import { addLocaleData } from 'react-intl';
import cs from 'react-intl/locale-data/cs';

import { configureStore } from './redux/store';
import { loggedInUserIdSelector } from './redux/selectors/auth';
import { isLoggedAsSuperAdmin } from './redux/selectors/users';
import { match } from './pages/routes';
import { TOKEN_COOKIES_KEY, INSTANCEID_COOKIES_KEY } from './redux/middleware/authMiddleware';
import { LANG_COOKIES_KEY } from './redux/middleware/langMiddleware';
import App from './containers/App';

addLocaleData([...cs]);

// Register global atob a btoa functions
global.Buffer = global.Buffer || require('buffer').Buffer;

if (typeof btoa === 'undefined') {
  global.btoa = str => Buffer.from(str).toString('base64');
}

if (typeof atob === 'undefined') {
  global.atob = b64Encoded => Buffer.from(b64Encoded, 'base64').toString();
}

/**
 * Init server-side rendering of the app using Express with
 * some basic middleware for tempaltes and static file serving.
 */

function getFileName(pattern, addPrefix = '') {
  const glob = require('glob');
  const files = glob.sync(pattern);
  if (!files || files.length < 1) {
    return null;
  }
  const fileName = files[0].substr(files[0].lastIndexOf('/') + 1);
  return fileName ? addPrefix + fileName : null;
}

const config = fs.readFileSync('etc/env.json', 'utf8');
const parsedConfig = JSON.parse(config);
const urlPrefix = parsedConfig.URL_PATH_PREFIX || '';

const bundle = process.env.BUNDLE || getFileName('public/bundle-*.js', `${urlPrefix}/`) || `${urlPrefix}/bundle.js`;
const style = getFileName('public/style-*.css', `${urlPrefix}/`) || `${urlPrefix}/style.css`;

const app = new Express();
const ejs = require('ejs').__express;
app.set('view engine', 'ejs');
app.engine('.ejs', ejs);
app.use(
  urlPrefix,
  Express.static('public', {
    immutable: true,
    maxAge: '30d',
    lastModified: true,
  })
);
app.use(cookieParser());

const renderPage = (res, store = null, html = '') => {
  const reduxState = store ? serialize(store.getState(), { isJSON: true }) : 'undefined';
  const head = Helmet.rewind();
  res.render('index', {
    html,
    head,
    reduxState,
    bundle,
    style,
    config,
    urlPrefix,
  });
};

app.get('*', (req, res) => {
  // Extract the accessToken from the cookies for authenticated API requests from the server.
  const token = req.cookies[TOKEN_COOKIES_KEY]; // undefined === the user is not logged in
  const instanceId = req.cookies[INSTANCEID_COOKIES_KEY] || null; // Selected instance
  const lang = req.cookies[LANG_COOKIES_KEY] || null; // Selected instance
  const store = configureStore(undefined, token, instanceId, lang);
  const location = req.originalUrl;
  const context = {};

  try {
    const userId = loggedInUserIdSelector(store.getState()); // try to get the user ID from the token (if any)
    const isSuperadmin = isLoggedAsSuperAdmin(store.getState());
    const { redirect, params, loadAsync } = match(location, Boolean(userId));

    if (redirect) {
      res.redirect(302, redirect);
    } else {
      Promise.all(
        loadAsync.map(la =>
          la(params, store.dispatch, {
            userId,
            isSuperadmin,
            instanceId,
          })
        )
      )
        .then(() => {
          const html = renderToString(
            <Provider store={store}>
              <StaticRouter location={location} context={context}>
                <App />
              </StaticRouter>
            </Provider>
          );
          renderPage(res, store, html);
        })
        .catch(() => renderPage(res)); // without SSR
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const port = parsedConfig.PORT;
app.listen(port, () => {
  console.log('Server is running on port ' + port); // eslint-disable-line no-console
});
