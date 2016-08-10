import 'isomorphic-fetch';

import React from 'react';
import { render } from 'react-dom';
import { fromJS } from 'immutable';

import { IntlProvider, addLocaleData } from 'react-intl';
import lang from 'react-intl/locale-data/en';
import messages from './locales/en';

import { Provider } from 'react-redux';
import { Router, browserHistory, useRouterHistory } from 'react-router';
import { syncHistoryWithStore } from 'react-router-redux';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import { configureStore } from './redux/store';
import createRoutes from './pages/routes';

import { getToken } from './redux/middleware/accessTokenMiddleware';

let state = fromJS(window.__INITIAL_STATE__) || undefined; // @todo This ain't gonna be so simple as 'fromJS' :/
const store = configureStore(browserHistory, state, getToken());
const createScrollHistory = useScroll(createBrowserHistory);
const appHistory = useRouterHistory(createScrollHistory)();
const history = syncHistoryWithStore(appHistory, store);

addLocaleData([ ...lang ]);

render(
  <IntlProvider locale='en' messages={messages}>
    <Provider store={store}>
      <Router
        history={history}
        routes={createRoutes(store.getState)} />
    </Provider>
  </IntlProvider>,
  document.getElementById('root')
);
