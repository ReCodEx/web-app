
// basic links
export const HOME_URI = '/';
export const DASHBOARD_URI = '/app';
export const LOGIN_URI = '/login';
export const LOGOUT_URI = '/logout';

// group details
export const GROUP_URI_FACTORY = id => `/app/group/${id}`;

// user details
export const USER_URI_FACTORY = id => `/app/user/${id}`;

// assignments and solution submissions
export const ASSIGNMENT_DETAIL_URI_FACTORY = id => `/app/assignment/${id}`;
export const SUBMIT_SOLUTION_URI_FACTORY = id =>
  ASSIGNMENT_DETAIL_URI_FACTORY(id) + '/submit';

export const SUBMISSION_DETAIL_URI_FACTORY = (assignmentId, submissionId) =>
  `/app/assignment/${assignmentId}/submission/${submissionId}`;
export const SOURCE_CODE_DETAIL_URI_FACTORY = (assignmentId, submissionId, fileId) =>
  `/app/assignment/${assignmentId}/submission/${submissionId}/file/${fileId}`;

// external links
export const BUGS_URL = 'https://www.github.com/recodex/web-app/issues';
