import React from 'react';
import { renderToString } from 'react-dom/server';
import Express from 'express';
import Promise from 'bluebird';
import Helmet from 'react-helmet';

import { match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-async-connect';
import { Provider } from 'react-redux';
import { syncHistoryWithStore } from 'react-router-redux';
import createHistory from 'react-router/lib/createMemoryHistory';
import { configureStore } from './src/redux/store';
import routes from './src/routes';

let app = new Express();
app.set('view engine', 'ejs');
app.use(Express.static('public'));

app.get('*', (req, res) => {
  const memoryHistory = createHistory(req.originalUrl);
  const store = configureStore(memoryHistory);
  const history = syncHistoryWithStore(memoryHistory, store);
  const location = req.originalUrl;

  match({ history, routes, location }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
      res.redirect(301, redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      res.status(500).send(error.message);
    } else if (renderProps == null) {
      res.status(404).send('Not found');
    } else {
      let reqUrl = location.pathname + location.search;

      loadOnServer(renderProps, store).then(() => {
        let reduxState = JSON.stringify(store.getState());
        let html = renderToString(
          <Provider store={store}>
            <ReduxAsyncConnect {...renderProps} />
          </Provider>
        );
        const head = Helmet.rewind();

        res.render('index', {
          html,
          head,
          reduxState,
          bundle: 'http://localhost:8080/bundle.js'
        });
      });
    }
  });
});

app.listen(8080, () => {
  console.log('Server is running on port 8080');
});
