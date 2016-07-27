import React from 'react';
import { asyncConnect } from 'redux-connect';
import { loggedInUserId } from '../../redux/selectors/auth';
import { fetchUserIfNeeded } from '../../redux/modules/users';

const App = ({
  children
}) => children;

export default asyncConnect(
  [{
      promise: ({ store: { dispatch, getState } }) =>
        dispatch(fetchUserIfNeeded(loggedInUserId(getState())))
  }]
)(App);
