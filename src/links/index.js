import { API_BASE, URL_PATH_PREFIX } from '../redux/helpers/api/tools';

export const linksFactory = lang => {
  const prefix = `${URL_PATH_PREFIX}/${lang}`;

  // basic links
  const HOME_URI = prefix;
  const DASHBOARD_URI = `${prefix}/app`;
  const LOGIN_URI = `${prefix}/login`;
  const LOGIN_URI_WITH_REDIRECT = redirLocation => {
    let redir = redirLocation.pathname;
    if (redirLocation.search) {
      redir += redirLocation.search;
    }
    return `${LOGIN_URI}/${encodeURIComponent(btoa(redir))}`;
  };
  const REGISTRATION_URI = `${prefix}/registration`;
  const LOGOUT_URI = `${URL_PATH_PREFIX}/logout`;
  const RESET_PASSWORD_URI = `${prefix}/forgotten-password`;

  // instance detail
  const INSTANCE_URI_FACTORY = id => `${prefix}/app/instance/${id}`;

  // group details
  const GROUP_INFO_URI_FACTORY = id => `${prefix}/app/group/${id}/info`;
  const GROUP_DETAIL_URI_FACTORY = id => `${prefix}/app/group/${id}/detail`;
  const GROUP_EDIT_URI_FACTORY = id => `${prefix}/app/group/${id}/edit`;

  // user details
  const USERS_URI = `${prefix}/app/users`;
  const USER_URI_FACTORY = id => `${prefix}/app/user/${id}`;
  const EDIT_USER_URI_FACTORY = id => `${USER_URI_FACTORY(id)}/edit`;

  // exercise details
  const EXERCISES_URI = `${prefix}/app/exercises`;
  const EXERCISE_CREATE_URI_FACTORY = () => `${EXERCISES_URI}`;
  const EXERCISE_URI_FACTORY = id => `${EXERCISES_URI}/${id}`;
  const EXERCISE_ASSIGNMENTS_URI_FACTORY = id => `${EXERCISES_URI}/${id}/assignments`;
  const EXERCISE_EDIT_URI_FACTORY = id => `${EXERCISE_URI_FACTORY(id)}/edit`;
  const EXERCISE_EDIT_CONFIG_URI_FACTORY = id => `${EXERCISE_URI_FACTORY(id)}/edit-config`;
  const EXERCISE_EDIT_LIMITS_URI_FACTORY = id => `${EXERCISE_URI_FACTORY(id)}/edit-limits`;

  // reference solution
  const EXERCISE_REFERENCE_SOLUTION_URI_FACTORY = (exerciseId, referenceSolutionId) =>
    `${EXERCISE_URI_FACTORY(exerciseId)}/reference-solution/${referenceSolutionId}`;

  // pipeline details
  const PIPELINES_URI = `${prefix}/app/pipelines`;
  const PIPELINE_CREATE_URI_FACTORY = () => `${PIPELINES_URI}`;
  const PIPELINE_URI_FACTORY = id => `${PIPELINES_URI}/${id}`;
  const PIPELINE_EDIT_URI_FACTORY = id => `${PIPELINE_URI_FACTORY(id)}/edit`;

  // assignments and solution submissions
  const ASSIGNMENT_DETAIL_URI_FACTORY = id => `${prefix}/app/assignment/${id}`;
  const ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY = (id, userId) =>
    `${ASSIGNMENT_DETAIL_URI_FACTORY(id)}/user/${userId}`;
  const ASSIGNMENT_EDIT_URI_FACTORY = id => `${ASSIGNMENT_DETAIL_URI_FACTORY(id)}/edit`;
  const SUBMIT_SOLUTION_URI_FACTORY = id => `${prefix}/app/assignment/${id}/submit`;
  const SOLUTION_DETAIL_URI_FACTORY = (assignmentId, submissionId) =>
    `${prefix}/app/assignment/${assignmentId}/solution/${submissionId}`;
  const ASSIGNMENT_STATS_URI_FACTORY = assignmentId => `${prefix}/app/assignment/${assignmentId}/stats`;

  const SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY = id => `${prefix}/app/shadow-assignment/${id}`;
  const SHADOW_ASSIGNMENT_EDIT_URI_FACTORY = id => `${SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(id)}/edit`;

  // group archive
  const ARCHIVE_URI = `${prefix}/app/archive`;

  // external links
  const BUGS_URL = `${prefix}/bugs-and-feedback`;
  const FAQ_URL = `${prefix}/faq`;
  const GITHUB_BUGS_URL = 'https://www.github.com/recodex/web-app/issues';

  // administration
  const ADMIN_URI = `${prefix}/admin`;
  const ADMIN_INSTANCES_URI = `${ADMIN_URI}/instances`;
  const ADMIN_EDIT_INSTANCE_URI_FACTORY = instanceId => `${ADMIN_INSTANCES_URI}/${instanceId}/edit`;

  // failures details
  const FAILURES_URI = `${prefix}/app/submission-failures`;

  // system messages (notifications)
  const MESSAGES_URI = `${prefix}/app/system-messages`;

  // sis integration
  const SIS_INTEGRATION_URI = `${prefix}/app/sis-integration`;

  // download files
  const DOWNLOAD = fileId => `${API_BASE}/uploaded-files/${fileId}/download`;

  // special links
  const LOGIN_EXTERN_FINALIZATION = service => `${URL_PATH_PREFIX}/login-extern/${service}`;

  // broker links
  const BROKER_URI = `${prefix}/app/broker`;

  return {
    API_BASE,
    HOME_URI,
    DASHBOARD_URI,
    LOGIN_URI,
    LOGIN_URI_WITH_REDIRECT,
    REGISTRATION_URI,
    LOGOUT_URI,
    RESET_PASSWORD_URI,
    INSTANCE_URI_FACTORY,
    GROUP_INFO_URI_FACTORY,
    GROUP_DETAIL_URI_FACTORY,
    GROUP_EDIT_URI_FACTORY,
    USERS_URI,
    USER_URI_FACTORY,
    EDIT_USER_URI_FACTORY,
    EXERCISES_URI,
    EXERCISE_URI_FACTORY,
    EXERCISE_EDIT_URI_FACTORY,
    EXERCISE_ASSIGNMENTS_URI_FACTORY,
    EXERCISE_EDIT_CONFIG_URI_FACTORY,
    EXERCISE_EDIT_LIMITS_URI_FACTORY,
    EXERCISE_CREATE_URI_FACTORY,
    EXERCISE_REFERENCE_SOLUTION_URI_FACTORY,
    PIPELINES_URI,
    PIPELINE_URI_FACTORY,
    PIPELINE_EDIT_URI_FACTORY,
    PIPELINE_CREATE_URI_FACTORY,
    ASSIGNMENT_EDIT_URI_FACTORY,
    ASSIGNMENT_DETAIL_URI_FACTORY,
    ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY,
    SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY,
    SHADOW_ASSIGNMENT_EDIT_URI_FACTORY,
    SUBMIT_SOLUTION_URI_FACTORY,
    SOLUTION_DETAIL_URI_FACTORY,
    ASSIGNMENT_STATS_URI_FACTORY,
    BUGS_URL,
    FAQ_URL,
    GITHUB_BUGS_URL,
    ADMIN_INSTANCES_URI,
    ADMIN_EDIT_INSTANCE_URI_FACTORY,
    DOWNLOAD,
    LOGIN_EXTERN_FINALIZATION,
    FAILURES_URI,
    MESSAGES_URI,
    SIS_INTEGRATION_URI,
    ARCHIVE_URI,
    BROKER_URI,
  };
};

export const removeFirstSegment = url => {
  if (url.length === 0) {
    return '';
  }

  if (url.startsWith(URL_PATH_PREFIX)) {
    url = url.substr(URL_PATH_PREFIX.length);
  }

  const lang = extractLanguageFromUrl(url);
  const firstSlash = url[0] === '/' ? 1 : 0;
  const langPartLength = firstSlash + lang.length;
  return url.substr(langPartLength);
};

export const changeLanguage = (url, lang) => `${URL_PATH_PREFIX}/${lang}${removeFirstSegment(url)}`;

export const extractLanguageFromUrl = url => {
  if (url.length === 0) {
    return null;
  }

  if (url.startsWith(URL_PATH_PREFIX)) {
    url = url.substr(URL_PATH_PREFIX.length);
  }

  url = url[0] === '/' ? url.substr(1) : url; // trim leading slash
  const separator = url.match(/[/?]/);
  return separator !== null ? url.substr(0, separator.index) : url;
};

export const isAbsolute = url => url.match('^(https?:)?//.+') !== null;

export const makeAbsolute = url =>
  typeof window === 'undefined' ? url : `${window.location.origin}/${url.indexOf('/') === 0 ? url.substr(1) : url}`;

export const absolute = url => (isAbsolute(url) ? url : makeAbsolute(url));
