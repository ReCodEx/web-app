
// basic links
export const HOME_URI = '/';
export const DASHBOARD_URI = '/app/dashboard';
export const LOGIN_URI = '/login';
export const LOGOUT_URI = '/logout';

// group details
export const GROUP_URI_FACTORY = id => `/app/group/${id}`;

// assignments and solution submissions
export const ASSIGNMENT_DETAIL_URI_FACTORY = id => `/app/assignment/${id}`;
export const SUBMISSION_DETAIL_URI_FACTORY =
  (assignmentId, submissionId) => `/app/assignment/${assignmentId}/submission/${submissionId}`;

// external links
export const BUGS_URL = 'https://www.github.com/recodex/web-app/issues';
