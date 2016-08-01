import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';

import auth, { actionTypes as authActionTypes } from './modules/auth';
import users from './modules/users';
import groups from './modules/groups';
import sidebar from './modules/sidebar';
import submission from './modules/submission';
import assignments from './modules/assignments';

const createRecodexReducers = (token) => ({
  auth: auth(token),
  sidebar,
  assignments,
  submission,
  users,
  groups
});

const librariesReducers = {
  routing: routerReducer,
  reduxAsyncConnect
};

const createReducer = (token) => {
  const appReducer = combineReducers(
    Object.assign(
      {},
      librariesReducers,
      createRecodexReducers(token)
    )
  );

  return (state, action) => {
    if (action.type === authActionTypes.LOGOUT) {
      state = undefined;
    }

    return appReducer(state, action);
  };
}

export default createReducer;
