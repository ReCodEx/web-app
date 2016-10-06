import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { memberOfInstancesIdsSelector } from './users';

const getExercises = state => state.exercises;
const getResources = exercises => exercises.get('resources');

export const exercisesSelector = createSelector(getExercises, getResources);
export const exerciseSelector = exerciseId =>
  createSelector(
    exercisesSelector,
    exercises => exercises.find(exercise => exercise.getIn(['data', 'id']) === exerciseId)
  );
