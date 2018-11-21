// necessary polyfill for both browser and server
import 'isomorphic-fetch';

// server setup
import React from 'react';
import { renderToString } from 'react-dom/server';
import serialize from 'serialize-javascript';
import Express from 'express';
import Promise from 'bluebird';
import Helmet from 'react-helmet';
import cookieParser from 'cookie-parser';
import fs from 'fs';

import { match, RouterContext } from 'react-router';

import { addLocaleData } from 'react-intl';
import cs from 'react-intl/locale-data/cs';

import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import createHistory from 'react-router/lib/createMemoryHistory';
import { configureStore } from './redux/store';
import { loggedInUserIdSelector } from './redux/selectors/auth';
import { isLoggedAsSuperAdmin } from './redux/selectors/users';
import createRoutes from './pages/routes';
import {
  TOKEN_COOKIES_KEY,
  INSTANCEID_COOKIES_KEY
} from './redux/middleware/authMiddleware';

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

const bundle =
  process.env.BUNDLE || getFileName('public/bundle-*.js', '/') || '/bundle.js';
const style = getFileName('public/style-*.css', '/') || '/style.css';
const config = fs.readFileSync('etc/env.json', 'utf8');
const parsedConfig = JSON.parse(config);

let app = new Express();
const ejs = require('ejs').__express;
app.set('view engine', 'ejs');
app.engine('.ejs', ejs);
app.use(
  Express.static('public', {
    immutable: true,
    maxAge: '30d',
    lastModified: true
  })
);
app.use(cookieParser());

const renderWithoutSSR = (res, renderProps) => {
  const head = Helmet.rewind();
  res.render('index', {
    html: '',
    head,
    reduxState: 'undefined',
    skin: parsedConfig['SKIN'],
    bundle,
    style,
    config
  });
};

const renderPage = (res, store, renderProps) => {
  let reduxState = serialize(store.getState(), { isJSON: true });
  let html = renderToString(
    <Provider store={store}>
      <RouterContext {...renderProps} />
    </Provider>
  );
  const head = Helmet.rewind();

  res.render('index', {
    html,
    head,
    reduxState,
    skin: parsedConfig['SKIN'],
    bundle,
    style,
    config
  });
};

app.get('*', (req, res) => {
  const memoryHistory = createHistory(req.originalUrl);
  // Extract the accessToken from the cookies for authenticated API requests from the server.
  const token = req.cookies[TOKEN_COOKIES_KEY]; // undefined === the user is not logged in
  const instanceId = req.cookies[INSTANCEID_COOKIES_KEY] || null; // Selected instance
  const store = configureStore(memoryHistory, undefined, token, instanceId);
  const history = syncHistoryWithStore(memoryHistory, store);
  const location = req.originalUrl;

  match(
    { history, routes: createRoutes(store.getState), location },
    (error, redirectLocation, renderProps) => {
      if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      } else if (error) {
        // @todo use the 500.ejs view
        res.status(500).send(error.message);
      } else if (renderProps == null) {
        // this should never happen but just for sure - if router failed
        res.status(404).send('Not found');
      } else {
        const userId = loggedInUserIdSelector(store.getState()); // try to get the user ID from the token (if any)
        const isSuperadmin = isLoggedAsSuperAdmin(store.getState());
        const loadAsync = renderProps.components
          .filter(component => component)
          .map(component => {
            // there might be several layers of wrapping - connect, withLinks, ...
            while (component.WrappedComponent) {
              component = component.WrappedComponent;
            }
            return component;
          })
          .filter(component => component.loadAsync)
          .map(component =>
            component.loadAsync(renderProps.params, store.dispatch, {
              userId,
              isSuperadmin,
              instanceId
            })
          );

        Promise.all(loadAsync)
          .then(() => renderPage(res, store, renderProps))
          .catch(() => renderWithoutSSR(res, renderProps));
      }
    }
  );
});

const port = parsedConfig['PORT'];
app.listen(port, () => {
  console.log('Server is running on port ' + port); // eslint-disable-line no-console
});
