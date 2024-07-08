import { createSelector, lruMemoize } from 'reselect';
import { EMPTY_ARRAY, EMPTY_LIST } from '../../helpers/common.js';
import { isReady } from '../helpers/resourceManager';

const getParam = (_, id) => id;

const getExercises = state => state.exercises;
const getResources = exercises => exercises && exercises.get('resources');
const getGroupExercises = state => state.groupExercises;
const getRuntimeEnvironments = exercise => exercise && exercise.getIn(['data', 'runtimeEnvironments'], EMPTY_LIST);

export const exercisesSelector = createSelector(getExercises, getResources);
export const exerciseSelector = exerciseId =>
  createSelector(exercisesSelector, exercises => exercises && exercises.get(exerciseId));

export const exerciseForkedFromSelector = lruMemoize(exerciseId =>
  createSelector(exercisesSelector, exercises => {
    const fokredId = exercises && exercises.getIn([exerciseId, 'data', 'forkedFrom']);
    return fokredId && exercises.get(fokredId);
  })
);

export const getExercise = id =>
  createSelector(getExercises, exercises => exercises && exercises.getIn(['resources', id]));

export const getExerciseSelector = createSelector(getExercises, exercises => id => exercises.getIn(['resources', id]));

export const getExerciseRuntimeEnvironments = lruMemoize(id => createSelector(getExercise(id), getRuntimeEnvironments));

export const getExerciseRuntimeEnvironmentsSelector = createSelector(
  getExerciseSelector,
  exerciseSelector => id => getRuntimeEnvironments(exerciseSelector(id))
);

export const getFork = (id, forkId) =>
  createSelector(getExercise(id), exercise => exercise.getIn(['data', 'forks', forkId]));

export const getExercisesByIdsSelector = ids =>
  createSelector(
    exercisesSelector,
    exercises =>
      exercises && exercises.filter(isReady).filter(exercise => ids.indexOf(exercise.getIn(['data', 'id'])) >= 0)
  );

export const getExercisesForGroup = createSelector(
  [exercisesSelector, getGroupExercises, getParam],
  (exercises, groupExercises, groupId) => {
    const groupExIds = groupExercises[groupId] ? groupExercises[groupId] : EMPTY_ARRAY;
    return (
      exercises && exercises.filter(isReady).filter(exercise => groupExIds.indexOf(exercise.getIn(['data', 'id'])) >= 0)
    );
  }
);

export const getExerciseAttachingGroupId = lruMemoize(id =>
  createSelector(getExercise(id), exercise => exercise && exercise.getIn(['data', 'attachingGroupId'], null))
);

export const getExerciseDetachingGroupId = lruMemoize(id =>
  createSelector(getExercise(id), exercise => exercise && exercise.getIn(['data', 'detachingGroupId'], null))
);

export const getExerciseTags = state => {
  const res = getExercises(state).get('tags');
  return res && Array.isArray(res) ? res : [];
};
export const getExerciseTagsLoading = state => getExercises(state).get('tags') === null;

export const getExerciseTagsUpdatePending = state => getExercises(state).get('tagsPending', null);

export const getExerciseSetArchivedStatus = createSelector(
  [exercisesSelector, getParam],
  (exercises, exerciseId) => exercises && exercises.getIn([exerciseId, 'archived'], null)
);

export const getExerciseSetAuthorStatus = createSelector(
  [exercisesSelector, getParam],
  (exercises, exerciseId) => exercises && exercises.getIn([exerciseId, 'author'], null)
);

export const getExerciseSetAdminsStatus = createSelector(
  [exercisesSelector, getParam],
  (exercises, exerciseId) => exercises && exercises.getIn([exerciseId, 'admins'], null)
);
