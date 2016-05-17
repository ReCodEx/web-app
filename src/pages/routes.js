import React from 'react';
import { Route, IndexRoute, Link } from 'react-router';

/* container components */
import LayoutContainer from '../containers/LayoutContainer';
import Home from './Home';
import Login from './Login';

const routes = (
  <Route path='/' component={LayoutContainer}>
    <IndexRoute component={Home} />
    <Route path='login' component={Login} />
  </Route>
);

export default routes;
