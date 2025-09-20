import React from 'react';
import { matchPath, Routes, Route, Navigate } from 'react-router-dom';
import { lruMemoize } from 'reselect';

/* container components */
import AcceptGroupInvitation from './AcceptGroupInvitation';
import AcceptInvitation from './AcceptInvitation';
import App from '../containers/App';
import Archive from './Archive';
import Assignment from './Assignment';
import AssignmentSolutions from './AssignmentSolutions';
import ChangePassword from './ChangePassword';
import Dashboard from './Dashboard';
import EditAssignment from './EditAssignment';
import EditExercise from './EditExercise';
import EditExerciseConfig from './EditExerciseConfig';
import EditExerciseLimits from './EditExerciseLimits';
import EditGroup from './EditGroup';
import EditInstances from './EditInstance';
import EditPipeline from './EditPipeline';
import EditPipelineStructure from './EditPipelineStructure';
import EditShadowAssignment from './EditShadowAssignment';
import EditUser from './EditUser';
import EmailVerification from './EmailVerification';
import Exercise from './Exercise';
import ExerciseAssignments from './ExerciseAssignments';
import ExerciseReferenceSolutions from './ExerciseReferenceSolutions';
import Exercises from './Exercises';
import FAQ from './FAQ';
import GroupAssignments from './GroupAssignments';
import GroupExams from './GroupExams';
import GroupInfo from './GroupInfo';
import GroupStudents from './GroupStudents';
import GroupUserSolutions from './GroupUserSolutions';
import Home from './Home';
import Instance from './Instance';
import Instances from './Instances';
import Login from './Login';
import NotFound from './NotFound';
import Pipeline from './Pipeline';
import Pipelines from './Pipelines';
import ReferenceSolution from './ReferenceSolution';
import Registration from './Registration';
import ResetPassword from './ResetPassword';
import ServerManagement from './ServerManagement';
import ShadowAssignment from './ShadowAssignment';
import Solution from './Solution';
import SolutionPlagiarisms from './SolutionPlagiarisms';
import SolutionSourceCodes from './SolutionSourceCodes';
import SubmissionFailures from './SubmissionFailures';
import SystemMessages from './SystemMessages/SystemMessages.js';
import User from './User';
import Users from './Users';

import { LOGIN_URI_PREFIX, createLoginLinkWithRedirect, abortAllPendingRequests } from '../redux/helpers/api/tools.js';
import { API_BASE, URL_PATH_PREFIX } from '../helpers/config.js';
import { getAssignment } from '../redux/selectors/assignments.js';
import { getShadowAssignment } from '../redux/selectors/shadowAssignments.js';
import withRouter from '../helpers/withRouter.js';

const unwrap = component => {
  while (component && component.WrappedComponent) {
    component = component.WrappedComponent;
  }
  return component;
};

// a global mechanism for suspending the abort optimization (when it can do some harm)
let abortSuspended = false;

export const suspendAbortPendingRequestsOptimization = () => {
  abortSuspended = true;
};

/**
 * Helper function for creating internal route declarations.
 * @param {String} basePath Route string (without prefix)
 * @param {Class} component Attached page component
 * @param {String} linkName Name of the link constant, under which this path is accessible in links
 * @param {Boolean|undefined} auth true = only authorized users, false = only unauthorized users, undefined = do not care
 */
const r = (basePath, component, linkName = '', auth = undefined) => {
  const path = basePath === '*' ? basePath : `${URL_PATH_PREFIX}/${basePath}`;

  /*
   * The abort of pending requests was shifted to unmount callback (since new router took away history.listen).
   * Top-level components are unmounted only when the page navigates to a different top-level component.
   */
  const rootComponent = unwrap(component);
  if (rootComponent && rootComponent.prototype) {
    const componentWillUnmount = rootComponent.prototype.componentWillUnmount;
    // must be an old 'function', so it captures 'this' properly
    rootComponent.prototype.componentWillUnmount = function (...args) {
      if (componentWillUnmount) {
        componentWillUnmount.call(this, ...args);
      }
      if (!abortSuspended) {
        abortAllPendingRequests();
      }
      abortSuspended = false;
    };
  }

  return {
    route: { path },
    component: withRouter(component),
    basePath,
    auth,
    linkName,
  };
};

// Route/Link declarations
const routesDescriptors = [
  r('', Home, 'HOME_URI'),
  r('faq', FAQ, 'FAQ_URL'),
  r(`${LOGIN_URI_PREFIX}/:redirect?`, Login, 'LOGIN_URI_FACTORY'),
  r('registration', Registration, 'REGISTRATION_URI', false), // false = only unauthorized
  r('forgotten-password', ResetPassword, 'RESET_PASSWORD_URI'),
  r('accept-invitation', AcceptInvitation, 'ACCEPT_INVITATION_URI'),
  r('accept-group-invitation/:invitationId', AcceptGroupInvitation, 'ACCEPT_GROUP_INVITATION_URI_FACTORY', true),
  r('app', Dashboard, 'DASHBOARD_URI', true),
  r('app/assignment/:assignmentId', Assignment, 'ASSIGNMENT_DETAIL_URI_FACTORY', true),
  r('app/assignment/:assignmentId/user/:userId', Assignment, 'ASSIGNMENT_DETAIL_SPECIFIC_USER_URI_FACTORY', true),
  r('app/assignment/:assignmentId/edit', EditAssignment, 'ASSIGNMENT_EDIT_URI_FACTORY', true),
  r('app/assignment/:assignmentId/solutions', AssignmentSolutions, 'ASSIGNMENT_SOLUTIONS_URI_FACTORY', true),
  r('app/assignment/:assignmentId/solution/:solutionId', Solution, 'SOLUTION_DETAIL_URI_FACTORY', true),
  r(
    'app/assignment/:assignmentId/solution/:solutionId/sources',
    SolutionSourceCodes,
    'SOLUTION_SOURCE_CODES_URI_FACTORY',
    true
  ),
  r(
    'app/assignment/:assignmentId/solution/:solutionId/diff/:secondSolutionId',
    SolutionSourceCodes,
    'SOLUTION_SOURCE_CODES_DIFF_URI_FACTORY',
    true
  ),
  r(
    'app/assignment/:assignmentId/solution/:solutionId/plagiarisms',
    SolutionPlagiarisms,
    'SOLUTION_PLAGIARISMS_URI_FACTORY',
    true
  ),
  r('app/shadow-assignment/:shadowId', ShadowAssignment, 'SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY', true),
  r('app/shadow-assignment/:shadowId/edit', EditShadowAssignment, 'SHADOW_ASSIGNMENT_EDIT_URI_FACTORY', true),
  r('app/exercises', Exercises, 'EXERCISES_URI', true),
  r('app/exercises/:exerciseId', Exercise, 'EXERCISE_URI_FACTORY', true),
  r('app/exercises/:exerciseId/edit', EditExercise, 'EXERCISE_EDIT_URI_FACTORY', true),
  r('app/exercises/:exerciseId/assignments', ExerciseAssignments, 'EXERCISE_ASSIGNMENTS_URI_FACTORY', true),
  r(
    'app/exercises/:exerciseId/reference-solutions',
    ExerciseReferenceSolutions,
    'EXERCISE_REFERENCE_SOLUTIONS_URI_FACTORY',
    true
  ),
  r('app/exercises/:exerciseId/edit-config', EditExerciseConfig, 'EXERCISE_EDIT_CONFIG_URI_FACTORY', true),
  r('app/exercises/:exerciseId/edit-limits', EditExerciseLimits, 'EXERCISE_EDIT_LIMITS_URI_FACTORY', true),
  r(
    'app/exercises/:exerciseId/reference-solution/:referenceSolutionId',
    ReferenceSolution,
    'REFERENCE_SOLUTION_URI_FACTORY',
    true
  ),
  r('app/pipelines', Pipelines, 'PIPELINES_URI', true),
  r('app/pipelines/:pipelineId', Pipeline, 'PIPELINE_URI_FACTORY', true),
  r('app/pipelines/:pipelineId/edit', EditPipeline, 'PIPELINE_EDIT_URI_FACTORY', true),
  r('app/pipelines/:pipelineId/edit-struct', EditPipelineStructure, 'PIPELINE_EDIT_STRUCT_URI_FACTORY', true),
  r('app/group/:groupId/edit', EditGroup, 'GROUP_EDIT_URI_FACTORY', true),
  r('app/group/:groupId/info', GroupInfo, 'GROUP_INFO_URI_FACTORY', true),
  r('app/group/:groupId/assignments', GroupAssignments, 'GROUP_ASSIGNMENTS_URI_FACTORY', true),
  r('app/group/:groupId/students', GroupStudents, 'GROUP_STUDENTS_URI_FACTORY', true),
  r('app/group/:groupId/exams', GroupExams, 'GROUP_EXAMS_URI_FACTORY', true),
  r('app/group/:groupId/exams/:examId', GroupExams, 'GROUP_EXAMS_SPECIFIC_EXAM_URI_FACTORY', true),
  r('app/group/:groupId/user/:userId', GroupUserSolutions, 'GROUP_USER_SOLUTIONS_URI_FACTORY', true),
  r('app/instance/:instanceId', Instance, 'INSTANCE_URI_FACTORY', true),
  r('app/users', Users, 'USERS_URI', true),
  r('app/user/:userId', User, 'USER_URI_FACTORY', true),
  r('app/user/:userId/edit', EditUser, 'EDIT_USER_URI_FACTORY', true),
  r('app/submission-failures', SubmissionFailures, 'FAILURES_URI', true),
  r('app/system-messages', SystemMessages, 'MESSAGES_URI', true),
  r('app/archive', Archive, 'ARCHIVE_URI', true),
  r('app/server', ServerManagement, 'SERVER_MANAGEMENT_URI', true),
  r('admin/instances', Instances, 'ADMIN_INSTANCES_URI', true),
  r('admin/instances/:instanceId/edit', EditInstances, 'ADMIN_EDIT_INSTANCE_URI_FACTORY', true),

  // Routes without links (to be linked from API notification emails)
  r('forgotten-password/change', ChangePassword),
  r('email-verification', EmailVerification, ''),
  r('*', NotFound),
];

/*
 * Routes
 */

const getRedirect = (routeObj, urlPath, isLoggedIn) => {
  if (routeObj.auth !== undefined && routeObj.auth !== isLoggedIn) {
    return routeObj.auth ? createLoginLinkWithRedirect(urlPath) : getLinks().DASHBOARD_URI;
  } else {
    return null;
  }
};

/**
 * Basically a replacement for old match function from react-router v3.
 * It tries to match actual route base on the URL and returns either a redirect
 * or route parameters + async load list of functions extracted from components info.
 * @param {String} urlPath
 * @param {Boolean} isLoggedIn
 */
export const match = (urlPath, isLoggedIn) => {
  const routeObj = routesDescriptors.find(({ route }) => matchPath(route, urlPath) !== null);
  const component = unwrap(routeObj.component);

  const redirect = getRedirect(routeObj, urlPath, isLoggedIn);
  const match = matchPath(routeObj.route, urlPath);

  const loadAsync = [unwrap(App).loadAsync(Boolean(component && component.customLoadGroups))];
  if (component && component.loadAsync) {
    loadAsync.push(component.loadAsync);
  }

  return { redirect, ...match, loadAsync };
};

export const buildRoutes = lruMemoize((urlPath, isLoggedIn) => {
  return (
    <Routes>
      {routesDescriptors.map(routeObj => {
        const redirect = getRedirect(routeObj, urlPath, isLoggedIn);
        return redirect ? (
          <Route key={routeObj.route.path} path={routeObj.route.path} element={<Navigate to={redirect} replace />} />
        ) : (
          <Route key={routeObj.route.path} path={routeObj.route.path} Component={routeObj.component} />
        );
      })}
    </Routes>
  );
});

export const pathHasCustomLoadGroups = lruMemoize(urlPath => {
  const routeObj = routesDescriptors.find(({ route }) => matchPath(route, urlPath) !== null);
  const component = unwrap(routeObj.component);
  return Boolean(component && component.customLoadGroups);
});

/**
 * A specialized function that uses combination of route decoding and redux selectors
 * to get groupId associated with current url path.
 * 1) If the component class has static member customRelatedGroupSelector, it is used as selector.
 *    (state and matched URL params are passed to it)
 * 2) if groupId is present in URL parameters, it is returned.
 * 3) If assignmentId or shadowId is present in URL, we select corresponding object from redux and
 *    get groupId from it.
 * @param {Object} state redux
 * @param {string} urlPath location + search URL part
 * @returns {string|null} groupId of null if no group is related
 */
export const pathRelatedGroupSelector = (state, urlPath) => {
  const routeObj = routesDescriptors.find(({ route }) => matchPath(route, urlPath) !== null);
  if (!routeObj) {
    return null;
  }
  const matchRes = matchPath(routeObj.route, urlPath);
  const component = unwrap(routeObj.component);
  if (component && component.customRelatedGroupSelector) {
    // completely custom selector given by the page component
    return component.customRelatedGroupSelector(state, matchRes.params);
  }

  // lets use default rules to extract group ID from path parameters
  if (matchRes.params) {
    if (matchRes.params.groupId) {
      return matchRes.params.groupId;
    }

    if (matchRes.params.assignmentId) {
      const assignment = getAssignment(state, matchRes.params.assignmentId);
      const groupId = assignment && assignment.getIn(['data', 'groupId']);
      if (groupId) {
        return groupId;
      }
    }

    if (matchRes.params.shadowId) {
      const shadow = getShadowAssignment(state)(matchRes.params.shadowId);
      const groupId = shadow && shadow.getIn(['data', 'groupId']);
      if (groupId) {
        return groupId;
      }
    }
  }

  return null;
};

/*
 * Links
 */

let linksCache = null;

const createLink = path => {
  const tokens = path.split('/');
  const index = [];
  tokens.forEach((token, idx) => {
    if (token.startsWith(':')) {
      index.push(idx);
    }
  });

  if (index.length > 0) {
    // link factory
    return (...params) => {
      const res = [...tokens]; // make a copy of URL path tokens (so we can fill in parameters)
      index.forEach(idx => (res[idx] = params.shift())); // fill in parameters using indexed positions
      while (res.length > 0 && !res[res.length - 1]) {
        // remove empty parameters at the end (params.shift() will fill in undefined for every missing parameter)
        res.pop();
      }
      res.unshift(URL_PATH_PREFIX);
      return res.join('/');
    };
  } else {
    // static link
    return `${URL_PATH_PREFIX}/${path}`;
  }
};

export const getLinks = () => {
  if (!linksCache) {
    // Fixed links not related to routes.
    linksCache = {
      API_BASE,
      GITHUB_BUGS_URL: 'https://www.github.com/recodex/web-app/issues',
      LOGIN_EXTERN_FINALIZATION_URI_FACTORY: service => `${URL_PATH_PREFIX}/login-extern/${service}`,
      DOWNLOAD: fileId => `${API_BASE}/uploaded-files/${fileId}/download`,
    };

    // Gather links from router descriptors
    routesDescriptors
      .filter(({ linkName, basePath }) => linkName && basePath !== '*')
      .forEach(({ route, linkName, basePath }) => {
        linksCache[linkName] = createLink(basePath);
      });

    // Additional link specializations...
    linksCache.LOGIN_URI = linksCache.LOGIN_URI_FACTORY(''); // empty string means bare endpoint
  }

  return linksCache;
};
