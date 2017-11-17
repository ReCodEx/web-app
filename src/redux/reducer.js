import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import auth, { actionTypes as authActionTypes } from './modules/auth';
import assignments from './modules/assignments';
import boxes from './modules/boxes';
import { default as canSubmit } from './modules/canSubmit'; // because of a named export 'canSubmit'
import comments from './modules/comments';
import emailVerification from './modules/emailVerification';
import evaluationProgress from './modules/evaluationProgress';
import exerciseConfigs from './modules/exerciseConfigs';
import exerciseEnvironmentConfigs from './modules/exerciseEnvironmentConfigs';
import exerciseScoreConfig from './modules/exerciseScoreConfig';
import exercises from './modules/exercises';
import pipelines from './modules/pipelines';
import files from './modules/files';
import filesContent from './modules/filesContent';
import groups from './modules/groups';
import publicGroups from './modules/publicGroups';
import groupResults from './modules/groupResults';
import groupExercises from './modules/groupExercises';
import instances from './modules/instances';
import licences from './modules/licences';
import limits from './modules/limits';
import simpleLimits from './modules/simpleLimits';
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
import userSwitching from './modules/userSwitching';
import runtimeEnvironments from './modules/runtimeEnvironments';
import supplementaryFiles from './modules/supplementaryFiles';
import pipelineFiles from './modules/pipelineFiles';
import additionalExerciseFiles from './modules/additionalExerciseFiles';
import referenceSolutions from './modules/referenceSolutions';
import hwGroups from './modules/hwGroups';
import sisStatus from './modules/sisStatus';
import sisSubscribedGroups from './modules/sisSubscribedGroups';
import sisSupervisedCourses from './modules/sisSupervisedCourses';
import sisPossibleParents from './modules/sisPossibleParents';
import referenceSolutionEvaluations from './modules/referenceSolutionEvaluations';
import submissionEvaluations from './modules/submissionEvaluations';

const createRecodexReducers = token => ({
  auth: auth(token),
  assignments,
  boxes,
  canSubmit,
  comments,
  emailVerification,
  evaluationProgress,
  exerciseConfigs,
  exerciseEnvironmentConfigs,
  exerciseScoreConfig,
  exercises,
  pipelines,
  files,
  filesContent,
  groups,
  publicGroups,
  groupResults,
  groupExercises,
  instances,
  licences,
  limits,
  simpleLimits,
  notifications,
  search,
  sidebar,
  stats,
  submission,
  submissions,
  registration,
  users,
  userSwitching,
  publicProfiles,
  upload,
  runtimeEnvironments,
  supplementaryFiles,
  pipelineFiles,
  referenceSolutions,
  referenceSolutionEvaluations,
  hwGroups,
  additionalExerciseFiles,
  sisStatus,
  sisSubscribedGroups,
  sisSupervisedCourses,
  sisPossibleParents,
  submissionEvaluations
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
