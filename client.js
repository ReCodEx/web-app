import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { Router, browserHistory, useRouterHistory } from 'react-router';
import { ReduxAsyncConnect } from 'redux-async-connect';
import { syncHistoryWithStore } from 'react-router-redux';
import useScroll from 'scroll-behavior/lib/useStandardScroll';
import createBrowserHistory from 'history/lib/createBrowserHistory';

import { configureStore } from './src/redux/store';
import routes from './src/routes';

let state = window.__INITIAL_STATE__ || undefined;
const store = configureStore(browserHistory, state);
const createScrollHistory = useScroll(createBrowserHistory);
const appHistory = useRouterHistory(createScrollHistory)();
const history = syncHistoryWithStore(appHistory, store);

render(
  <Provider store={store}>
    <Router
      render={(props) =>
        <ReduxAsyncConnect {...props} />}
      history={history}
      routes={routes} />
  </Provider>,
  document.getElementById('root')
);
