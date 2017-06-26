import { API_BASE } from '../redux/helpers/api/tools';

export const linksFactory = lang => {
  const prefix = `/${lang}`;

  // basic links
  const HOME_URI = prefix;
  const DASHBOARD_URI = `${prefix}/app`;
  const LOGIN_URI = `${prefix}/login`;
  const REGISTRATION_URI = `${prefix}/registration`;
  const LOGOUT_URI = '/logout';
  const RESET_PASSWORD_URI = `${prefix}/forgotten-password`;

  // instance detail
  const INSTANCE_URI_FACTORY = id => `${prefix}/app/instance/${id}`;

  // group details
  const GROUP_URI_FACTORY = id => `${prefix}/app/group/${id}`;
  const GROUP_EDIT_URI_FACTORY = id => `${GROUP_URI_FACTORY(id)}/edit`;

  // user details
  const USERS_URI = `${prefix}/app/users`;
  const USER_URI_FACTORY = id => `${prefix}/app/user/${id}`;
  const EDIT_USER_URI_FACTORY = id => `${USER_URI_FACTORY(id)}/edit`;

  // exercise details
  const EXERCISES_URI = `${prefix}/app/exercises`;
  const EXERCISE_CREATE_URI_FACTORY = () => `${EXERCISES_URI}`;
  const EXERCISE_URI_FACTORY = id => `${EXERCISES_URI}/${id}`;
  const EXERCISE_EDIT_URI_FACTORY = id => `${EXERCISE_URI_FACTORY(id)}/edit`;
  const EXERCISE_REFERENCE_SOLUTION_URI_FACTORY = (
    exerciseId,
    referenceSolutionId
  ) =>
    `${EXERCISE_URI_FACTORY(exerciseId)}/reference-solution/${referenceSolutionId}`;

  // assignments and solution submissions
  const ASSIGNMENT_DETAIL_URI_FACTORY = id => `${prefix}/app/assignment/${id}`;
  const ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY = (id, userId) =>
    `${ASSIGNMENT_DETAIL_URI_FACTORY(id)}/user/${userId}`;
  const ASSIGNMENT_EDIT_URI_FACTORY = id =>
    `${ASSIGNMENT_DETAIL_URI_FACTORY(id)}/edit`;
  const SUBMIT_SOLUTION_URI_FACTORY = id =>
    `${prefix}/app/assignment/${id}/submit`;
  const SUBMISSION_DETAIL_URI_FACTORY = (assignmentId, submissionId) =>
    `${prefix}/app/assignment/${assignmentId}/submission/${submissionId}`;
  const SUPERVISOR_STATS_URI_FACTORY = assignmentId =>
    `${prefix}/app/assignment/${assignmentId}/stats`;
  const SOURCE_CODE_DETAIL_URI_FACTORY = (assignmentId, submissionId, fileId) =>
    `${prefix}/app/assignment/${assignmentId}/submission/${submissionId}/file/${fileId}`;

  // external links
  const BUGS_URL = 'https://www.github.com/recodex/web-app/issues';

  // administration
  const ADMIN_URI = `${prefix}/admin`;
  const ADMIN_INSTANCES_URI = `${ADMIN_URI}/instances`;
  const ADMIN_EDIT_INSTANCE_URI_FACTORY = instanceId =>
    `${ADMIN_INSTANCES_URI}/${instanceId}/edit`;

  // download files
  const DOWNLOAD = fileId => `${API_BASE}/uploaded-files/${fileId}/download`;

  return {
    API_BASE,
    HOME_URI,
    DASHBOARD_URI,
    LOGIN_URI,
    REGISTRATION_URI,
    LOGOUT_URI,
    RESET_PASSWORD_URI,
    INSTANCE_URI_FACTORY,
    GROUP_URI_FACTORY,
    GROUP_EDIT_URI_FACTORY,
    USERS_URI,
    USER_URI_FACTORY,
    EDIT_USER_URI_FACTORY,
    EXERCISES_URI,
    EXERCISE_URI_FACTORY,
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_CREATE_URI_FACTORY,
    EXERCISE_REFERENCE_SOLUTION_URI_FACTORY,
    ASSIGNMENT_EDIT_URI_FACTORY,
    ASSIGNMENT_DETAIL_URI_FACTORY,
    ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY,
    SUBMIT_SOLUTION_URI_FACTORY,
    SUBMISSION_DETAIL_URI_FACTORY,
    SUPERVISOR_STATS_URI_FACTORY,
    SOURCE_CODE_DETAIL_URI_FACTORY,
    BUGS_URL,
    ADMIN_INSTANCES_URI,
    ADMIN_EDIT_INSTANCE_URI_FACTORY,
    DOWNLOAD
  };
};

export const removeFirstSegment = url => {
  if (url.length === 0) {
    return '';
  }

  const lang = extractLanguageFromUrl(url);
  const firstSlash = url[0] === '/' ? 1 : 0;
  const langPartLength = firstSlash + lang.length;
  return url.substr(langPartLength);
};
export const changeLanguage = (url, lang) =>
  `/${lang}${removeFirstSegment(url)}`;

export const extractLanguageFromUrl = url => {
  if (url.length === 0) {
    return null;
  }

  url = url[0] === '/' ? url.substr(1) : url; // trim leading slash
  const separator = url.match(/[/?]/);
  return separator !== null ? url.substr(0, separator.index) : url;
};

export const isAbsolute = url => url.match('^(https?:)?//.+') !== null;

export const makeAbsolute = url =>
  typeof window === 'undefined'
    ? url
    : `${window.location.origin}/${url.indexOf('/') === 0 ? url.substr(1) : url}`;

export const absolute = url => (isAbsolute(url) ? url : makeAbsolute(url));
