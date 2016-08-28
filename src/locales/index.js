import messagesCs from './cs';
import messagesEn from './en';

import en from 'react-intl/locale-data/en';
import cs from 'react-intl/locale-data/cs';

export const messages = { cs: messagesCs, en: messagesEn };
export const localeData = { cs, en };
export const defaultLanguage = 'en';
