import 'isomorphic-fetch';

import React from 'react';
import { render } from 'react-dom';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { configureStore } from './redux/store';
import { getToken, getInstanceId } from './redux/middleware/authMiddleware';
import { getLang } from './redux/middleware/langMiddleware';
import App from './containers/App';

import 'admin-lte/plugins/jquery/jquery.min.js';
import 'admin-lte/plugins/jquery-ui/jquery-ui.min.js';
import 'admin-lte/plugins/bootstrap/js/bootstrap.bundle.min.js';
import 'admin-lte/dist/js/adminlte.js';

// load the initial state form the server - if any
let state;
const ini = window.__INITIAL_STATE__;
const blacklist = ['userSwitching'];
if (ini) {
  state = {};
  Object.keys(ini).map(key => {
    state[key] = blacklist.includes(key) ? ini[key] : fromJS(ini[key]);
  });
}

const store = configureStore(state, getToken(), getInstanceId(), getLang());

render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
);
