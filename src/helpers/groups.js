import { safeGet } from './common.js';

export const isExam = group => {
  const examBegin = safeGet(group, ['privateData', 'examBegin']);
  const examEnd = safeGet(group, ['privateData', 'examEnd']);
  const now = Date.now() / 1000;
  return examBegin && examEnd && examEnd > now && examBegin <= now;
};
