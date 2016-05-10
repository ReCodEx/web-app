import React from 'react';
import { Route, IndexRoute, Link } from 'react-router';

/* container components */
import LayoutContainer from './containers/LayoutContainer';
import Home from './pages/Home';
import Login from './pages/Login';

const routes = (
  <Route path='/' component={LayoutContainer}>
    <IndexRoute component={Home} />
    <Route path='login' component={Login} />
  </Route>
);

export default routes;
