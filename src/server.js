// necessary polyfill for both browser and server
import 'cross-fetch/dist/node-polyfill.js';

// server setup
import serialize from 'serialize-javascript';
import Express from 'express';
import ejs from 'ejs';
import Helmet from 'react-helmet';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import { globSync } from 'glob';

import { configureOurStore } from './redux/store.js';
import { loggedInUserIdSelector } from './redux/selectors/auth.js';
import { match } from './pages/routes.js';
import { TOKEN_COOKIES_KEY, INSTANCEID_COOKIES_KEY } from './redux/middleware/authMiddleware.js';
import { LANG_COOKIES_KEY } from './redux/middleware/langMiddleware.js';

import '@formatjs/intl-pluralrules/polyfill.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/cs.js';
import '@formatjs/intl-relativetimeformat/polyfill.js';
import '@formatjs/intl-relativetimeformat/locale-data/en.js';
import '@formatjs/intl-relativetimeformat/locale-data/cs.js';

/**
 * Init server-side rendering of the app using Express with
 * some basic middleware for templates and static file serving.
 */

function getFileName(pattern, addPrefix = '') {
  const files = globSync(pattern, { posix: true });
  if (!files || files.length < 1) {
    return null;
  }
  const fileName = files[0].substring(files[0].lastIndexOf('/') + 1);
  return fileName ? addPrefix + fileName : null;
}

const config = fs.readFileSync('etc/env.json', 'utf8');
const parsedConfig = JSON.parse(config);
const urlPrefix = parsedConfig.URL_PATH_PREFIX || '';

const bundle = process.env.BUNDLE || getFileName('public/bundle-*.js', `${urlPrefix}/`) || `${urlPrefix}/bundle.js`;
const style = getFileName('public/style-*.css', `${urlPrefix}/`) || `${urlPrefix}/style.css`;

const app = new Express();
app.set('view engine', 'ejs');
app.engine('ejs', ejs.__express);
app.use(
  urlPrefix,
  Express.static('public', {
    immutable: true,
    maxAge: '30d',
    lastModified: true,
  })
);
app.use(cookieParser());

/**
 * Note: this method was originally created to support SSR (serialize store as well).
 * At present, we have no additional support for SSR and some features (like user IP locking)
 * will not work at all. SSR may be reintroduce in the future, but this should be rewritten.
 */
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

// 'splat' is the name of the * wildcard (new in Express 5.x)
app.get('*splat', (req, res) => {
  // Extract the accessToken from the cookies for authenticated API requests from the server.
  const token = req.cookies[TOKEN_COOKIES_KEY]; // undefined === the user is not logged in
  const instanceId = req.cookies[INSTANCEID_COOKIES_KEY] || null; // Selected instance
  const lang = req.cookies[LANG_COOKIES_KEY] || null; // Selected instance
  const store = configureOurStore(undefined, token, instanceId, lang);
  const location = req.originalUrl;

  try {
    /*
     * Important!
     * Parts that were responsible for SSR were disabled on 26.1.2024.
     * SSR were not working properly and new API features (IP locking) were introduced
     * that are not SSR ready.
     * We keep the original code commented, so this may be fixed in the future.
     */

    const userId = loggedInUserIdSelector(store.getState()); // try to get the user ID from the token (if any)
    const { redirect /*, params, loadAsync */ } = match(location, Boolean(userId));
    // const isSuperadmin = isLoggedAsSuperAdmin(store.getState());
    // const context = {};

    if (redirect) {
      res.redirect(302, redirect);
    } else {
      renderPage(res);
      /*
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
        */
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
});

const port = parsedConfig.PORT;
app.listen(port, () => {
  console.log('Server is running on port ' + port); // eslint-disable-line no-console
});
