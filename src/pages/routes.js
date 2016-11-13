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
import Exercise from './Exercise';
import EditExercise from './EditExercise';
import Group from './Group';
import instance from './Instance';
import Login from './Login';
import Assignment from './Assignment';
import EditAssignment from './EditAssignment';
import NotFound from './NotFound';
import Submission from './Submission';
import Registration from './Registration';
import User from './User';

import ChangePassword from './ChangePassword';
import ResetPassword from './ResetPassword';

const createRoutes = (getState) => {
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

  const maybeWithoutLanguage = (nextState, replace) => {
    const url = nextState.location.pathname;
    const lang = extractLanguageFromUrl(url);
    if (!isAvailable(lang)) {
      // try to correct the url by adding the lang in the URL
      // this surely won't cause a redirect loop even if the url
      // still won't match any route, since it will now begin
      // with an available language
      replace(`/${defaultLanguage}${url}`);
    }
  };

  return (
    <Route path='/' onEnter={checkLanguage}>
      <Route path='/:lang' component={LayoutContainer}>
        <IndexRoute component={Home} />
        <Route path='login' component={Login} onEnter={onlyUnauth} />
        <Route path='registration' component={Registration} onEnter={onlyUnauth} />
        <Route path='app' component={App} onEnter={requireAuth}>
          <IndexRoute component={Dashboard} />
          <Route path='assignment/:assignmentId'>
            <IndexRoute component={Assignment} />
            <Route path='edit' component={EditAssignment} />
            <Route path='submission/:submissionId' component={Submission} />
          </Route>
          <Route path='exercise/:exerciseId'>
            <IndexRoute component={Exercise} />
            <Route path='edit' component={EditExercise} />
          </Route>
          <Route path='group/:groupId' component={Group} />
          <Route path='instance/:instanceId' component={instance} />
          <Route path='user/:userId' component={User} />
        </Route>
        <Route path='forgotten-password'>
          <IndexRoute component={ResetPassword} />
          <Route path='change' component={ChangePassword} />
        </Route>
        <Route path='*' component={NotFound} />
      </Route>
    </Route>
  );
};

export default createRoutes;
