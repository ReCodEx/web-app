import 'cross-fetch/dist/node-polyfill.js';

import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import 'mock-local-storage';

/*
 * The loader.js holds nodejs hooks that override module import behavior.
 * These modifications are necessary to
 * 1) bypass import paths that are not fully specified
 * 2) suppress loads of CJS modules that would not work in the mocha/nodejs.
 */
register('./test/loader.js', pathToFileURL('./'));

global.document = new JSDOM('<!doctype html><html><body></body></html>');
global.window = global.document.window;
global.navigator = global.window.navigator;

class FormData {
  _data = {};

  append(key, value) {
    this._data[key] = value;
  }

  get(key) {
    return this._data[key];
  }
}

global.FormData = FormData;
