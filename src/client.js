import 'isomorphic-fetch';

import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory, useRouterHistory } from 'react-router';
import { ReduxAsyncConnect } from 'redux-async-connect';
import { syncHistoryWithStore } from 'react-router-redux';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import { configureStore } from './redux/store';
import routes from './pages/routes';

import { getToken } from './redux/middleware/accessTokenMiddleware';
import { apiCall } from './redux/api';

let state = window.__INITIAL_STATE__ || undefined;
const store = configureStore(browserHistory, state, getToken());
const createScrollHistory = useScroll(createBrowserHistory);
const appHistory = useRouterHistory(createScrollHistory)();
const history = syncHistoryWithStore(appHistory, store);

render(
  <Provider store={store}>
    <Router
      render={(props) =>
        <ReduxAsyncConnect {...props} helpers={{ apiCall }} />}
      history={history}
      routes={routes} />
  </Provider>,
  document.getElementById('root')
);
