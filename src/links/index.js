
// basic links
export const DASHBOARD_URI = '/';
export const LOGIN_URI = '/login';
export const LOGOUT_URI = '/logout';

// group details
export const GROUP_URI_FACTORY = id => `/group/${id}`;

// assignments and solution submissions
export const ASSIGNMENT_DETAIL_URI_FACTORY = id => `/assignment/${id}`;
export const SUBMISSION_DETAIL_URI_FACTORY =
  (assignmentId, submissionId) => `/assignment/${assignmentId}/submission/${submissionId}`;

// external links
export const BUGS_URL = 'https://www.github.com/recodex/web-app/issues';
