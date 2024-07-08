import { canUseDOM } from '../helpers/common.js';

import messagesCs from './cs.json';
import messagesEn from './en.json';

import '@formatjs/intl-pluralrules/polyfill.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/cs.js';
import '@formatjs/intl-relativetimeformat/polyfill.js';
import '@formatjs/intl-relativetimeformat/locale-data/en.js';
import '@formatjs/intl-relativetimeformat/locale-data/cs.js';

export const messages = { cs: messagesCs, en: messagesEn };
export const isAvailable = lang => Object.keys(messages).indexOf(lang) !== -1;

export const getDefaultLang = () => {
  if (canUseDOM) {
    const lang = (window.navigator.userLanguage || window.navigator.language).substr(0, 2);
    if (messages[lang]) {
      return lang;
    }
  }

  return 'en';
};
export const defaultLanguage = getDefaultLang();
