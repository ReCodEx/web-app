import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import app from './modules/app';
import assignments from './modules/assignments';
import attachmentFiles from './modules/attachmentFiles';
import auth, { actionTypes as authActionTypes } from './modules/auth';
import boxes from './modules/boxes';
import canSubmitModule from './modules/canSubmit'; // because of a named export 'canSubmit'
import comments from './modules/comments';
import emailVerification from './modules/emailVerification';
import evaluationProgress from './modules/evaluationProgress';
import exerciseConfigs from './modules/exerciseConfigs';
import exerciseEnvironmentConfigs from './modules/exerciseEnvironmentConfigs';
import exercisePipelinesVariables from './modules/exercisePipelinesVariables';
import exerciseScoreConfig from './modules/exerciseScoreConfig';
import exerciseTests from './modules/exerciseTests';
import exercises from './modules/exercises';
import exercisesAuthors from './modules/exercisesAuthors';
import files from './modules/files';
import filesContent from './modules/filesContent';
import groups from './modules/groups';
import groupResults from './modules/groupResults';
import groupExercises from './modules/groupExercises';
import hwGroups from './modules/hwGroups';
import instances from './modules/instances';
import licences from './modules/licences';
import limits from './modules/limits';
import notifications from './modules/notifications';
import pagination from './modules/pagination';
import pipelines from './modules/pipelines';
import pipelineFiles from './modules/pipelineFiles';
import referenceSolutions from './modules/referenceSolutions';
import referenceSolutionEvaluations from './modules/referenceSolutionEvaluations';
import registration from './modules/registration';
import runtimeEnvironments from './modules/runtimeEnvironments';
import shadowAssignments from './modules/shadowAssignments';
import sidebar from './modules/sidebar';
import sisPossibleParents from './modules/sisPossibleParents';
import sisStatus from './modules/sisStatus';
import sisSubscribedGroups from './modules/sisSubscribedGroups';
import sisSupervisedCourses from './modules/sisSupervisedCourses';
import sisTerms from './modules/sisTerms';
import solutions from './modules/solutions';
import stats from './modules/stats';
import submission from './modules/submission';
import submissionEvaluations from './modules/submissionEvaluations';
import submissionFailures from './modules/submissionFailures';
import supplementaryFiles from './modules/supplementaryFiles';
import upload from './modules/upload';
import users from './modules/users';
import userSwitching from './modules/userSwitching';
import broker from './modules/broker';
import systemMessages from './modules/systemMessages';

const createRecodexReducers = (token, instanceId) => ({
  app,
  assignments,
  attachmentFiles,
  auth: auth(token, instanceId),
  boxes,
  broker,
  canSubmit: canSubmitModule,
  comments,
  emailVerification,
  evaluationProgress,
  exerciseConfigs,
  exerciseEnvironmentConfigs,
  exercisePipelinesVariables,
  exerciseScoreConfig,
  exerciseTests,
  exercises,
  exercisesAuthors,
  files,
  filesContent,
  groups,
  groupResults,
  groupExercises,
  hwGroups,
  instances,
  licences,
  limits,
  notifications,
  pagination,
  pipelines,
  pipelineFiles,
  referenceSolutions,
  referenceSolutionEvaluations,
  registration,
  runtimeEnvironments,
  shadowAssignments,
  sidebar,
  sisPossibleParents,
  sisSubscribedGroups,
  sisSupervisedCourses,
  sisStatus,
  sisTerms,
  solutions,
  stats,
  submission,
  submissionEvaluations,
  submissionFailures,
  supplementaryFiles,
  systemMessages,
  upload,
  users,
  userSwitching,
});

const librariesReducers = {
  routing: routerReducer,
  form: formReducer,
};

const createReducer = (token, instanceId) => {
  const appReducer = combineReducers(Object.assign({}, librariesReducers, createRecodexReducers(token, instanceId)));

  return (state, action) => {
    if (action.type === authActionTypes.LOGOUT) {
      state = undefined;
    }

    return appReducer(state, action);
  };
};

export default createReducer;
