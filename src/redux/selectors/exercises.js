import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { allParentIdsForGroup } from './groups';

const getExercises = state => state.exercises;
const getResources = exercises => exercises.get('resources');

export const exercisesSelector = createSelector(getExercises, getResources);
export const exerciseSelector = exerciseId =>
  createSelector(exercisesSelector, exercises => exercises.get(exerciseId));

export const getExercise = id =>
  createSelector(getExercises, exercises => exercises.getIn(['resources', id]));

export const getFork = (id, forkId) =>
  createSelector(getExercise(id), exercise =>
    exercise.getIn(['data', 'forks', forkId])
  );

export const groupExercisesSelector = groupId =>
  createSelector(
    [exercisesSelector, allParentIdsForGroup(groupId)],
    (exercises, groupIds) =>
      exercises
        .filter(isReady)
        .filter(
          exercise => groupIds.indexOf(exercise.getIn(['data', 'groupId'])) >= 0
        )
  );
