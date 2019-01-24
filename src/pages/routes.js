import React from 'react';
import { Route, IndexRoute } from 'react-router';
import { linksFactory, extractLanguageFromUrl, changeLanguage } from '../links';
import { isAvailable, defaultLanguage } from '../locales';
import { isLoggedIn } from '../redux/selectors/auth';

/* container components */
import LayoutContainer from '../containers/LayoutContainer';
import App from '../containers/App';
import Dashboard from './Dashboard';
import Home from './Home';
import EmailVerification from './EmailVerification';
import Exercise from './Exercise';
import ExerciseAssignments from './ExerciseAssignments';
import Exercises from './Exercises';
import EditExercise from './EditExercise';
import EditExerciseConfig from './EditExerciseConfig';
import EditExerciseLimits from './EditExerciseLimits';
import GroupDetail from './GroupDetail';
import GroupInfo from './GroupInfo';
import EditGroup from './EditGroup';
import Instance from './Instance';
import Instances from './Instances';
import EditInstances from './EditInstance';
import Login from './Login';
import LoginExternFinalization from './LoginExternFinalization';
import Assignment from './Assignment';
import EditAssignment from './EditAssignment';
import AssignmentStats from './AssignmentStats';
import ShadowAssignment from './ShadowAssignment';
import EditShadowAssignment from './EditShadowAssignment';
import NotFound from './NotFound';
import Solution from './Solution';
import Registration from './Registration';
import Users from './Users';
import User from './User';
import EditUser from './EditUser';
import ReferenceSolution from './ReferenceSolution';
import Pipelines from './Pipelines';
import EditPipeline from './EditPipeline';
import Pipeline from './Pipeline';
import FAQ from './FAQ';
import SubmissionFailures from './SubmissionFailures';
import SisIntegration from './SisIntegration';
import Archive from './Archive';

import ChangePassword from './ChangePassword';
import ResetPassword from './ResetPassword';

const createRoutes = getState => {
  const getLang = state => state.params.lang;
  const getLinks = state => linksFactory(getLang(state));

  const requireAuth = (nextState, replace) => {
    if (!isLoggedIn(getState())) {
      replace(getLinks(nextState).LOGIN_URI);
    }
  };

  const onlyUnauth = (nextState, replace) => {
    if (isLoggedIn(getState())) {
      replace(getLinks(nextState).DASHBOARD_URI);
    }
  };

  const checkEmptyRoute = (nextState, replace) => {
    // Make sure an empty route leads to default language
    const url = nextState.location.pathname;
    if (url === '/') {
      replace(changeLanguage(url, defaultLanguage));
    }
  };

  const checkLanguage = (nextState, replace) => {
    const url = nextState.location.pathname;
    const lang = extractLanguageFromUrl(url);
    if (!isAvailable(lang)) {
      replace(changeLanguage(url, defaultLanguage));
    }
  };

  return (
    <Route path="/" component={App} onEnter={checkEmptyRoute}>
      <Route
        exact
        path="/login-extern/:service"
        component={LoginExternFinalization}
      />
      <Route path="/:lang" component={LayoutContainer} onEnter={checkLanguage}>
        <IndexRoute component={Home} />
        <Route path="login" component={Login} onEnter={onlyUnauth} />
        <Route
          path="registration"
          component={Registration}
          onEnter={onlyUnauth}
        />
        <Route path="faq" component={FAQ} />
        <Route path="email-verification" component={EmailVerification} />
        <Route path="app" onEnter={requireAuth}>
          <IndexRoute component={Dashboard} customLoadGroups={true} />
          <Route path="assignment/:assignmentId">
            <IndexRoute component={Assignment} />
            <Route path="user/:userId" component={Assignment} />
            <Route path="edit" component={EditAssignment} />
            <Route path="stats" component={AssignmentStats} />
            <Route path="solution/:solutionId" component={Solution} />
          </Route>
          <Route path="shadow-assignment/:assignmentId">
            <IndexRoute component={ShadowAssignment} />
            <Route path="edit" component={EditShadowAssignment} />
          </Route>
          <Route path="exercises">
            <IndexRoute component={Exercises} />
            <Route path=":exerciseId">
              <IndexRoute component={Exercise} />
              <Route path="edit" component={EditExercise} />
              <Route path="assignments" component={ExerciseAssignments} />
              <Route path="edit-config" component={EditExerciseConfig} />
              <Route path="edit-limits" component={EditExerciseLimits} />
              <Route
                path="reference-solution/:referenceSolutionId"
                component={ReferenceSolution}
              />
            </Route>
          </Route>
          <Route path="pipelines">
            <IndexRoute component={Pipelines} />
            <Route path=":pipelineId">
              <IndexRoute component={Pipeline} />
              <Route path="edit" component={EditPipeline} />
            </Route>
          </Route>
          <Route path="group/:groupId">
            <Route path="edit" component={EditGroup} />
            <Route path="info" component={GroupInfo} />
            <Route path="detail" component={GroupDetail} />
          </Route>
          <Route path="instance/:instanceId" component={Instance} />
          <Route path="users" component={Users} />
          <Route path="user/:userId">
            <IndexRoute component={User} customLoadGroups={true} />
            <Route path="edit" component={EditUser} />
          </Route>
          <Route path="submission-failures" component={SubmissionFailures} />
          <Route path="sis-integration" component={SisIntegration} />
          <Route path="archive" component={Archive} customLoadGroups={true} />
        </Route>
        <Route path="forgotten-password">
          <IndexRoute component={ResetPassword} />
          <Route path="change" component={ChangePassword} />
        </Route>
        <Route path="admin" onEnter={requireAuth}>
          <Route path="instances">
            <IndexRoute component={Instances} />
            <Route path=":instanceId">
              <Route path="edit" component={EditInstances} />
            </Route>
          </Route>
        </Route>
        <Route path="*" component={NotFound} />
      </Route>
    </Route>
  );
};

export default createRoutes;
