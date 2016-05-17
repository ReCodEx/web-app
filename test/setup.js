import { jsdom } from 'jsdom';
import 'mock-local-storage';
import 'isomorphic-fetch';

global.document = jsdom('<!doctype html><html><body></body></html>');
global.window = document.defaultView;
global.navigator = global.window.navigator;

class FormData {

  _data = {};

  append(key, value) {
    _data[key] = value;
  }

  get(key) {
    return _data[key];
  }

}

global.FormData = FormData;
