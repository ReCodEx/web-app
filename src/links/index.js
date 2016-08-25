
// basic links
export const HOME_URI = '/';
export const DASHBOARD_URI = '/app';
export const LOGIN_URI = '/login';
export const REGISTRATION_URI = '/registration';
export const LOGOUT_URI = '/logout';

// instance detail
export const INSTANCE_URI_FACTORY = id => `${DASHBOARD_URI}/instance/${id}`;

// group details
export const GROUP_URI_FACTORY = id => `${DASHBOARD_URI}/group/${id}`;

// user details
export const USER_URI_FACTORY = id => `${DASHBOARD_URI}/user/${id}`;

// assignments and solution submissions
export const ASSIGNMENT_DETAIL_URI_FACTORY = id => `${DASHBOARD_URI}/assignment/${id}`;
export const SUBMIT_SOLUTION_URI_FACTORY = id =>
  ASSIGNMENT_DETAIL_URI_FACTORY(id) + '/submit';

export const SUBMISSION_DETAIL_URI_FACTORY = (assignmentId, submissionId) =>
  `${DASHBOARD_URI}/assignment/${assignmentId}/submission/${submissionId}`;
export const SOURCE_CODE_DETAIL_URI_FACTORY = (assignmentId, submissionId, fileId) =>
  `${DASHBOARD_URI}/assignment/${assignmentId}/submission/${submissionId}/file/${fileId}`;

// external links
export const BUGS_URL = 'https://www.github.com/recodex/web-app/issues';
