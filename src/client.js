import 'cross-fetch/polyfill';

import React from 'react';
import { createRoot } from 'react-dom/client';
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
import 'ace-builds';
import 'ace-builds/webpack-resolver';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-csharp';
import 'ace-builds/src-noconflict/mode-css';
import 'ace-builds/src-noconflict/mode-groovy';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/mode-kotlin';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-makefile';
import 'ace-builds/src-noconflict/mode-pascal';
import 'ace-builds/src-noconflict/mode-php';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-rust';
import 'ace-builds/src-noconflict/mode-scala';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/keybinding-vim';

import ace from 'ace-builds/src-noconflict/ace';

// override of worker paths, so they load properly
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

// set Prismjs to manual mode (if present)
window.Prism = window.Prism || {};
window.Prism.manual = true;

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

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
