
export const linksFactory = lang => {
  const prefix = `/${lang}`;

  // basic links
  const HOME_URI = prefix;
  const DASHBOARD_URI = `${prefix}/app`;
  const LOGIN_URI = `${prefix}/login`;
  const REGISTRATION_URI = `${prefix}/registration`;
  const LOGOUT_URI = '/logout';

  // instance detail
  const INSTANCE_URI_FACTORY = id => `${prefix}/app/instance/${id}`;

  // group details
  const GROUP_URI_FACTORY = id => `${prefix}/app/group/${id}`;

  // user details
  const USER_URI_FACTORY = id => `${prefix}/app/user/${id}`;

  // exercise details
  const EXERCISE_URI_FACTORY = id => `${prefix}/app/exercise/${id}`;

  // assignments and solution submissions
  const ASSIGNMENT_EDIT_URI_FACTORY = id => `${prefix}/app/assignment/${id}`; // @todo
  const ASSIGNMENT_DETAIL_URI_FACTORY = id => `${prefix}/app/assignment/${id}`;
  const SUBMIT_SOLUTION_URI_FACTORY = id =>
    `${prefix}/app/assignment/${id}/submit`;
  const SUBMISSION_DETAIL_URI_FACTORY = (assignmentId, submissionId) =>
    `${prefix}/app/assignment/${assignmentId}/submission/${submissionId}`;
  const SOURCE_CODE_DETAIL_URI_FACTORY = (assignmentId, submissionId, fileId) =>
    `${prefix}/app/assignment/${assignmentId}/submission/${submissionId}/file/${fileId}`;

  // external links
  const BUGS_URL = 'https://www.github.com/recodex/web-app/issues';

  return {
    HOME_URI, DASHBOARD_URI, LOGIN_URI, REGISTRATION_URI, LOGOUT_URI,
    INSTANCE_URI_FACTORY, GROUP_URI_FACTORY, USER_URI_FACTORY,
    EXERCISE_URI_FACTORY,
    ASSIGNMENT_EDIT_URI_FACTORY, ASSIGNMENT_DETAIL_URI_FACTORY, SUBMIT_SOLUTION_URI_FACTORY,
    SUBMISSION_DETAIL_URI_FACTORY, SOURCE_CODE_DETAIL_URI_FACTORY,
    BUGS_URL
  };
};

const removeFirstSegment = url =>
  url.substr(1).indexOf('/') === -1
    ? '/'
    : url.substr(url.substr(1).indexOf('/') + 1);

export const changeLanguage = (url, lang) =>
  `/${lang}${removeFirstSegment(url)}`;

export const extractLanguageFromUrl = url => {
  url = url.substr(0, 1) === '/' ? url.substr(1) : url; // trim leading slash
  return url.substr(0, url.indexOf('/'));
};

export const isAbsolute = url => url.match('^(https?:)?//.+');
