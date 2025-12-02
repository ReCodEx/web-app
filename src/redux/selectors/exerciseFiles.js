import { createSelector, lruMemoize } from 'reselect';

import { fetchFilesForExerciseEndpoint } from '../modules/exerciseFiles.js';
import { EMPTY_MAP } from '../../helpers/common.js';
import { isReady } from '../helpers/resourceManager';
import { getExercise } from './exercises.js';

export const exerciseFilesSelector = state => state.exerciseFiles.get('resources');
const exerciseFilesFetchManyStatusSelector = state => state.exerciseFiles.get('fetchManyStatus');

export const getFilesForExercise = lruMemoize(exerciseId =>
  createSelector([getExercise(exerciseId), exerciseFilesSelector], (exercise, files) => {
    const ids = exercise && exercise.getIn(['data', 'filesIds']);
    return ids && files
      ? files.filter(isReady).filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
      : EMPTY_MAP;
  })
);

export const fetchFilesForExerciseStatus = createSelector(
  exerciseFilesFetchManyStatusSelector,
  status => exerciseId => status.get(fetchFilesForExerciseEndpoint(exerciseId))
);
