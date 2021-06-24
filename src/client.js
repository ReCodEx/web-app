import 'cross-fetch/polyfill';

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

// Patch for ACE editor (it has complex loading)
require('ace-builds');
require('ace-builds/webpack-resolver');
require('ace-builds/src-noconflict/theme-monokai');
require('ace-builds/src-noconflict/theme-github');
require('ace-builds/src-noconflict/mode-c_cpp');
require('ace-builds/src-noconflict/mode-csharp');
require('ace-builds/src-noconflict/mode-css');
require('ace-builds/src-noconflict/mode-groovy');
require('ace-builds/src-noconflict/mode-html');
require('ace-builds/src-noconflict/mode-kotlin');
require('ace-builds/src-noconflict/mode-java');
require('ace-builds/src-noconflict/mode-javascript');
require('ace-builds/src-noconflict/mode-makefile');
require('ace-builds/src-noconflict/mode-pascal');
require('ace-builds/src-noconflict/mode-php');
require('ace-builds/src-noconflict/mode-python');
require('ace-builds/src-noconflict/mode-rust');
require('ace-builds/src-noconflict/mode-scala');
require('ace-builds/src-noconflict/mode-typescript');
require('ace-builds/src-noconflict/keybinding-vim');

// override of worker paths, so they load properly
const ace = require('ace-builds/src-noconflict/ace');
const ACE_CDN_PREFIX = 'https://cdn.jsdelivr.net/npm/ace-builds@1.4.12/src-noconflict/';
ace.config.set('basePath', ACE_CDN_PREFIX);
const KNOWN_ACE_WORKERS = {
  base_worker: 'worker-base',
  css_worker: 'worker-css',
  html_worker: 'worker-html',
  javascript_worker: 'worker-javascript',
  php_worker: 'worker-php',
  xml_worker: 'worker-xml',
};
Object.keys(KNOWN_ACE_WORKERS).forEach(key => {
  ace.config.setModuleUrl(`ace/mode/${key}`, `${ACE_CDN_PREFIX}${KNOWN_ACE_WORKERS[key]}.js`);
});

// load the initial state form the server - if any
let state;
const ini = window.__INITIAL_STATE__;
const blacklist = ['userSwitching'];
if (ini) {
  state = {};
  Object.keys(ini).forEach(key => {
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
