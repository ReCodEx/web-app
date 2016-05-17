import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect';

import auth from './modules/auth';
import sidebar from './modules/sidebar';

const createRecodexReducers = (token) => ({
  auth: auth(token),
  sidebar
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
