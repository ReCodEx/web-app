import { canUseDOM } from 'exenv';
import { safeGet } from './common';

export const getConfigVar = name => {
  var MY_VAR = '';
  if (canUseDOM) {
    MY_VAR = safeGet(window, ['__RECODEX_CONFIG__', name], '');
  } else {
    const fs = require('fs');
    MY_VAR = JSON.parse(fs.readFileSync('etc/env.json', 'utf8'))[name] || '';
  }
  return MY_VAR;
};

export const API_BASE = getConfigVar('API_BASE');
export const URL_PATH_PREFIX = getConfigVar('URL_PATH_PREFIX') || '';
