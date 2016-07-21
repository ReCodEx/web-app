import React from 'react';
import { Route, IndexRoute, Link } from 'react-router';

/* container components */
import LayoutContainer from '../containers/LayoutContainer';
import Home from './Home';
import Login from './Login';
import Assignment from './Assignment';
import SubmissionDetailContainer from '../containers/SubmissionDetailContainer';

const routes = (
  <Route path='/' component={LayoutContainer}>
    <IndexRoute component={Home} />
    <Route path='login' component={Login} />
    <Route path='assignment/:assignmentId' component={Assignment}>
      <Route path='submission/:submissionId' component={SubmissionDetailContainer} />
    </Route>
  </Route>
);

export default routes;
