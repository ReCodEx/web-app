import 'cross-fetch/dist/browser-polyfill.js';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { fromJS } from 'immutable';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { configureOurStore } from './redux/store.js';
import { getToken, getInstanceId } from './redux/middleware/authMiddleware.js';
import { getLang } from './redux/middleware/langMiddleware.js';
import App from './containers/App/index.js';

import 'admin-lte/dist/js/adminlte.js';

// Patch for ACE editor (it has complex loading)
import ace from 'ace-builds';
import 'ace-builds/webpack-resolver.js';
import 'ace-builds/src-noconflict/theme-monokai.js';
import 'ace-builds/src-noconflict/theme-github.js';
import 'ace-builds/src-noconflict/mode-c_cpp.js';
import 'ace-builds/src-noconflict/mode-csharp.js';
import 'ace-builds/src-noconflict/mode-css.js';
import 'ace-builds/src-noconflict/mode-groovy.js';
import 'ace-builds/src-noconflict/mode-html.js';
import 'ace-builds/src-noconflict/mode-kotlin.js';
import 'ace-builds/src-noconflict/mode-java.js';
import 'ace-builds/src-noconflict/mode-javascript.js';
import 'ace-builds/src-noconflict/mode-makefile.js';
import 'ace-builds/src-noconflict/mode-markdown.js';
import 'ace-builds/src-noconflict/mode-pascal.js';
import 'ace-builds/src-noconflict/mode-php.js';
import 'ace-builds/src-noconflict/mode-python.js';
import 'ace-builds/src-noconflict/mode-rust.js';
import 'ace-builds/src-noconflict/mode-scala.js';
import 'ace-builds/src-noconflict/mode-typescript.js';
import 'ace-builds/src-noconflict/keybinding-vim.js';

/*
 * This is an ugly hack that deals with deprecated warnings generated in console log by obsolete
 * Overlay and OverlayTrigger components.
 * TODO FIXME: Remove after upgrading to react-bootstrap 2.0 and AdminLTE 4 (hopefully, the warnings will disapear).
 */
// const consoleError = console.error; // eslint-disable-line no-console
// console.error /* eslint-disable-line no-console */ = (msg, ...rest) => {
//   if (typeof msg === 'string') {
//     if (msg.startsWith('Warning: findDOMNode is deprecated and will be removed in the next major release.')) {
//       return;
//     }
//     if (msg.includes('Support for defaultProps will be removed')) {
//       return;
//     }
//   }
//   consoleError(msg, ...rest);
// };

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

const store = configureOurStore(state, getToken(), getInstanceId(), getLang());

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);
