import { canUseDOM } from 'exenv';

import messagesCs from './cs'; // eslint-disable-line
import messagesEn from './en'; // eslint-disable-line

import en from 'react-intl/locale-data/en';
import cs from 'react-intl/locale-data/cs';

export const messages = { cs: messagesCs, en: messagesEn };
export const isAvailable = lang => Object.keys(messages).indexOf(lang) !== -1;
export const localeData = { cs, en };

export const getDefaultLang = () => {
  if (canUseDOM) {
    const lang = (window.navigator.userLanguage || window.navigator.language)
      .substr(0, 2);
    if (messages[lang]) {
      return lang;
    }
  }

  return 'en';
};
export const defaultLanguage = getDefaultLang();
