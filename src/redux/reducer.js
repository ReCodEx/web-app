import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect';

import sidebar from './modules/sidebar';

const recodexReducers = {
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
