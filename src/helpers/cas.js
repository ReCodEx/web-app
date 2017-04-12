export const createCASLoginUrl = redirectUrl =>
  `https://idp.cuni.cz/cas?service=${redirectUrl}`;

export const getTicketFromUrl = url => {
  const match = url.match(/[?&]ticket=([^&\b]+)/);
  return match === null ? null : match[1];
};
