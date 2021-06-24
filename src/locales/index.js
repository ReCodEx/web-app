import { canUseDOM } from 'exenv';

import messagesCs from './cs'; // eslint-disable-line
import messagesEn from './en'; // eslint-disable-line

import '@formatjs/intl-pluralrules/polyfill';
import '@formatjs/intl-pluralrules/locale-data/en';
import '@formatjs/intl-pluralrules/locale-data/cs';
import '@formatjs/intl-relativetimeformat/polyfill';
import '@formatjs/intl-relativetimeformat/locale-data/en';
import '@formatjs/intl-relativetimeformat/locale-data/cs';

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
