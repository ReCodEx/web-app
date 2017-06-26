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
import Exercises from './Exercises';
import EditExercise from './EditExercise';
import Group from './Group';
import EditGroup from './EditGroup';
import Instance from './Instance';
import Instances from './Instances';
import EditInstances from './EditInstance';
import Login from './Login';
import Assignment from './Assignment';
import EditAssignment from './EditAssignment';
import AssignmentStats from './AssignmentStats';
import NotFound from './NotFound';
import Submission from './Submission';
import Registration from './Registration';
import Users from './Users';
import User from './User';
import EditUser from './EditUser';
import ReferenceSolution from './ReferenceSolution';

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

  const checkLanguage = (nextState, replace) => {
    const url = nextState.location.pathname;
    const lang = extractLanguageFromUrl(url);
    if (!isAvailable(lang)) {
      replace(changeLanguage(url, defaultLanguage));
    }
  };

  return (
    <Route path="/" component={App} onEnter={checkLanguage}>
      <Route path="/:lang" component={LayoutContainer}>
        <IndexRoute component={Home} />
        <Route path="login" component={Login} onEnter={onlyUnauth} />
        <Route
          path="registration"
          component={Registration}
          onEnter={onlyUnauth}
        />
        <Route path="email-verification" component={EmailVerification} />
        <Route path="app" onEnter={requireAuth}>
          <IndexRoute component={Dashboard} />
          <Route path="assignment/:assignmentId">
            <IndexRoute component={Assignment} />
            <Route path="user/:userId" component={Assignment} />
            <Route path="edit" component={EditAssignment} />
            <Route path="stats" component={AssignmentStats} />
            <Route path="submission/:submissionId" component={Submission} />
          </Route>
          <Route path="exercises">
            <IndexRoute component={Exercises} />
            <Route path=":exerciseId">
              <IndexRoute component={Exercise} />
              <Route path="edit" component={EditExercise} />
              <Route
                path="reference-solution/:referenceSolutionId"
                component={ReferenceSolution}
              />
            </Route>
          </Route>
          <Route path="group/:groupId">
            <IndexRoute component={Group} />
            <Route path="edit" component={EditGroup} />
          </Route>
          <Route path="instance/:instanceId" component={Instance} />
          <Route path="users" component={Users} />
          <Route path="user/:userId">
            <IndexRoute component={User} />
            <Route path="edit" component={EditUser} />
          </Route>
        </Route>
        <Route path="forgotten-password">
          <IndexRoute component={ResetPassword} />
          <Route path="change" component={ChangePassword} />
        </Route>
        <Route path="admin">
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
