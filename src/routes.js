import React from 'react';
import { Route, IndexRoute, Link } from 'react-router';

/* container components */
import LayoutContainer from './containers/LayoutContainer';
import Home from './pages/Home';

const routes = (
  <Route path='/' component={LayoutContainer}>
    <IndexRoute component={Home} />
  </Route>
);

export default routes;
