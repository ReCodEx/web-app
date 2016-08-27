
export const linksFactory = lang => {
  const prefix = `/${lang}`;

  return {
    // basic links
    'HOME_URI': prefix,
    'DASHBOARD_URI': `${prefix}/app`,
    'LOGIN_URI': lang => `${prefix}/login`,
    'REGISTRATION_URI': lang => `${prefix}/registration`,
    'LOGOUT_URI': '/logout',

    // instance detail
    'INSTANCE_URI_FACTORY': (lang, id) => `${prefix}/app/instance/${id}`,

    // group details
    'GROUP_URI_FACTORY': id => `${prefix}/app/group/${id}`,

    // user details
    'USER_URI_FACTORY': id => `${prefix}/app/user/${id}`,

    // assignments and solution submissions
    'ASSIGNMENT_DETAIL_URI_FACTORY': id => `${prefix}/app/assignment/${id}`,
    'SUBMIT_SOLUTION_URI_FACTORY': id =>
      `${prefix}/app/assignment/${id}/submit`,
    'SUBMISSION_DETAIL_URI_FACTORY': (assignmentId, submissionId) =>
      `${prefix}/app/assignment/${assignmentId}/submission/${submissionId}`,
    'SOURCE_CODE_DETAIL_URI_FACTORY': (assignmentId, submissionId, fileId) =>
      `${prefix}/app/assignment/${assignmentId}/submission/${submissionId}/file/${fileId}`,

    // external links
    'BUGS_URL': 'https://www.github.com/recodex/web-app/issues'
  };
};

