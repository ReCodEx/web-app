import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import app from './modules/app';
import assignments from './modules/assignments';
import asyncJobs from './modules/asyncJobs';
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
import groupExercises from './modules/groupExercises';
import groupInvitations from './modules/groupInvitations';
import groupResults from './modules/groupResults';
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
import solutionFiles from './modules/solutionFiles';
import solutionReviews from './modules/solutionReviews';
import stats from './modules/stats';
import submission from './modules/submission';
import submissionEvaluations from './modules/submissionEvaluations';
import submissionFailures from './modules/submissionFailures';
import supplementaryFiles from './modules/supplementaryFiles';
import upload from './modules/upload';
import userCalendars from './modules/userCalendars';
import users from './modules/users';
import userSwitching from './modules/userSwitching';
import broker from './modules/broker';
import systemMessages from './modules/systemMessages';

const createRecodexReducers = (token, instanceId, lang) => ({
  app: app(lang),
  assignments,
  asyncJobs,
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
  groupExercises,
  groupInvitations,
  groupResults,
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
  solutionFiles,
  solutionReviews,
  stats,
  submission,
  submissionEvaluations,
  submissionFailures,
  supplementaryFiles,
  systemMessages,
  upload,
  userCalendars,
  users,
  userSwitching,
});

const librariesReducers = {
  form: formReducer,
};

const createReducer = (token, instanceId, lang) => {
  const appReducer = combineReducers(
    Object.assign({}, librariesReducers, createRecodexReducers(token, instanceId, lang))
  );

  return (state, action) => {
    if (action.type === authActionTypes.LOGOUT) {
      state = undefined;
    }

    return appReducer(state, action);
  };
};

export default createReducer;
