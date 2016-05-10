import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect';

import auth from './modules/auth';
import sidebar from './modules/sidebar';

const recodexReducers = {
  auth,
  sidebar
};

const librariesReducers = {
  routing: routerReducer,
  reduxAsyncConnect
};

export default combineReducers(
  Object.assign(
    {},
    librariesReducers,
    recodexReducers
  )
);
