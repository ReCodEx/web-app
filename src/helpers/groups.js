export const isExam = ({ privateData: { examBegin, examEnd } }) => {
  const now = Date.now() / 1000;
  return examBegin && examEnd && examEnd > now && examBegin <= now;
};
