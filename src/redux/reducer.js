import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import auth, { actionTypes as authActionTypes } from './modules/auth';
import assignments from './modules/assignments';
import { default as canSubmit } from './modules/canSubmit'; // because of a named export 'canSubmit'
import comments from './modules/comments';
import emailVerification from './modules/emailVerification';
import evaluationProgress from './modules/evaluationProgress';
import exerciseConfigs from './modules/exerciseConfigs';
import exerciseEnvironmentConfigs from './modules/exerciseEnvironmentConfigs';
import exercises from './modules/exercises';
import pipelines from './modules/pipelines';
import files from './modules/files';
import filesContent from './modules/filesContent';
import groups from './modules/groups';
import groupResults from './modules/groupResults';
import instances from './modules/instances';
import licences from './modules/licences';
import notifications from './modules/notifications';
import publicProfiles from './modules/publicProfiles';
import { default as search } from './modules/search'; // because of a named export 'search'
import sidebar from './modules/sidebar';
import stats from './modules/stats';
import submission from './modules/submission';
import submissions from './modules/submissions';
import registration from './modules/registration';
import upload from './modules/upload';
import users from './modules/users';
import runtimeEnvironments from './modules/runtimeEnvironments';
import supplementaryFiles from './modules/supplementaryFiles';
import additionalExerciseFiles from './modules/additionalExerciseFiles';
import referenceSolutions from './modules/referenceSolutions';
import referenceSolutionEvaluations from './modules/referenceSolutionEvaluations';
import hwGroups from './modules/hwGroups';
import sisStatus from './modules/sisStatus';

const createRecodexReducers = token => ({
  auth: auth(token),
  assignments,
  canSubmit,
  comments,
  emailVerification,
  evaluationProgress,
  exerciseConfigs,
  exerciseEnvironmentConfigs,
  exercises,
  pipelines,
  files,
  filesContent,
  groups,
  groupResults,
  instances,
  licences,
  notifications,
  publicProfiles,
  search,
  sidebar,
  stats,
  submission,
  submissions,
  registration,
  users,
  upload,
  runtimeEnvironments,
  supplementaryFiles,
  referenceSolutions,
  referenceSolutionEvaluations,
  hwGroups,
  additionalExerciseFiles,
  sisStatus
});

const librariesReducers = {
  routing: routerReducer,
  form: formReducer
};

const createReducer = token => {
  const appReducer = combineReducers(
    Object.assign({}, librariesReducers, createRecodexReducers(token))
  );

  return (state, action) => {
    if (action.type === authActionTypes.LOGOUT) {
      state = undefined;
    }

    return appReducer(state, action);
  };
};

export default createReducer;
