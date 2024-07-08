import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';

import app from './modules/app.js';
import assignments from './modules/assignments.js';
import asyncJobs from './modules/asyncJobs.js';
import attachmentFiles from './modules/attachmentFiles.js';
import auth, { actionTypes as authActionTypes } from './modules/auth.js';
import boxes from './modules/boxes.js';
import canSubmitModule from './modules/canSubmit.js'; // because of a named export 'canSubmit'
import comments from './modules/comments.js';
import emailVerification from './modules/emailVerification.js';
import evaluationProgress from './modules/evaluationProgress.js';
import exerciseConfigs from './modules/exerciseConfigs.js';
import exerciseEnvironmentConfigs from './modules/exerciseEnvironmentConfigs.js';
import exercisePipelinesVariables from './modules/exercisePipelinesVariables.js';
import exerciseScoreConfig from './modules/exerciseScoreConfig.js';
import exerciseTests from './modules/exerciseTests.js';
import exercises from './modules/exercises.js';
import exercisesAuthors from './modules/exercisesAuthors.js';
import files from './modules/files.js';
import filesContent from './modules/filesContent.js';
import groups from './modules/groups.js';
import groupExamLocks from './modules/groupExamLocks.js';
import groupExercises from './modules/groupExercises.js';
import groupInvitations from './modules/groupInvitations.js';
import groupResults from './modules/groupResults.js';
import hwGroups from './modules/hwGroups.js';
import instances from './modules/instances.js';
import licences from './modules/licences.js';
import limits from './modules/limits.js';
import notifications from './modules/notifications.js';
import pagination from './modules/pagination.js';
import pipelines from './modules/pipelines.js';
import pipelineFiles from './modules/pipelineFiles.js';
import plagiarisms from './modules/plagiarisms.js';
import referenceSolutions from './modules/referenceSolutions.js';
import referenceSolutionEvaluations from './modules/referenceSolutionEvaluations.js';
import registration from './modules/registration.js';
import runtimeEnvironments from './modules/runtimeEnvironments.js';
import shadowAssignments from './modules/shadowAssignments.js';
import sidebar from './modules/sidebar.js';
import sisPossibleParents from './modules/sisPossibleParents.js';
import sisStatus from './modules/sisStatus.js';
import sisSubscribedGroups from './modules/sisSubscribedGroups.js';
import sisSupervisedCourses from './modules/sisSupervisedCourses.js';
import sisTerms from './modules/sisTerms.js';
import solutions from './modules/solutions.js';
import solutionFiles from './modules/solutionFiles.js';
import solutionReviews from './modules/solutionReviews.js';
import stats from './modules/stats.js';
import submission from './modules/submission.js';
import submissionEvaluations from './modules/submissionEvaluations.js';
import submissionFailures from './modules/submissionFailures.js';
import supplementaryFiles from './modules/supplementaryFiles.js';
import upload from './modules/upload.js';
import userCalendars from './modules/userCalendars.js';
import users from './modules/users.js';
import userSwitching from './modules/userSwitching.js';
import broker from './modules/broker.js';
import systemMessages from './modules/systemMessages.js';

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
  groupExamLocks,
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
  plagiarisms,
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
