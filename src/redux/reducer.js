import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import auth, { actionTypes as authActionTypes } from './modules/auth';
import assignments from './modules/assignments';
import comments from './modules/comments';
import evaluationProgress from './modules/evaluationProgress';
import files from './modules/files';
import groups from './modules/groups';
import sidebar from './modules/sidebar';
import submission from './modules/submission';
import submissions from './modules/submissions';
import users from './modules/users';

const createRecodexReducers = (token) => ({
  auth: auth(token),
  assignments,
  comments,
  evaluationProgress,
  files,
  groups,
  sidebar,
  submission,
  submissions,
  users
});

const librariesReducers = {
  routing: routerReducer
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
};

export default createReducer;
