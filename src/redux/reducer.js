import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-connect';

import auth from './modules/auth';
import users from './modules/users';
import sidebar from './modules/sidebar';
import submission from './modules/submission';

const createRecodexReducers = (token) => ({
  auth: auth(token),
  sidebar,
  submission,
  users
});

const librariesReducers = {
  routing: routerReducer,
  reduxAsyncConnect
};

const createReducer = (token) =>
  combineReducers(
    Object.assign(
      {},
      librariesReducers,
      createRecodexReducers(token)
    )
  );

export default createReducer;
