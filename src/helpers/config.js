import { canUseDOM } from 'exenv';
import { safeGet } from './common';

export const getConfigVar = name => {
  let MY_VAR = '';
  if (canUseDOM) {
    MY_VAR = safeGet(window, ['__RECODEX_CONFIG__', name], '');
  } else {
    const fs = require('fs');
    MY_VAR = JSON.parse(fs.readFileSync('etc/env.json', 'utf8'))[name] || '';
  }
  return MY_VAR;
};

export const getConfigVarLocalized = (name, locale) => {
  const value = getConfigVar(name);
  if (typeof value !== 'object') {
    return value;
  }

  if (value[locale] !== undefined) {
    return value[locale];
  }

  if (value.en !== undefined) {
    return value.en; // fallback to english if selected locale is not available
  }

  const firstLocale = Object.keys(value)[0];
  if (firstLocale !== undefined && value[firstLocale] !== undefined) {
    return value[firstLocale]; // fallback to first defined locale
  }

  return '';
};

export const API_BASE = getConfigVar('API_BASE');
export const URL_PATH_PREFIX = getConfigVar('URL_PATH_PREFIX') || '';
