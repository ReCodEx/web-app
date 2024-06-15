import { createSelector, lruMemoize } from 'reselect';

import { fetchSupplementaryFilesForExerciseEndpoint } from '../modules/supplementaryFiles';
import { EMPTY_MAP } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';
import { getExercise } from './exercises';

export const supplementaryFilesSelector = state => state.supplementaryFiles.get('resources');
const supplementaryFilesFetchManyStatusSelector = state => state.supplementaryFiles.get('fetchManyStatus');

export const getSupplementaryFilesForExercise = lruMemoize(exerciseId =>
  createSelector([getExercise(exerciseId), supplementaryFilesSelector], (exercise, supplementaryFiles) => {
    const ids = exercise && exercise.getIn(['data', 'supplementaryFilesIds']);
    return ids && supplementaryFiles
      ? supplementaryFiles.filter(isReady).filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
      : EMPTY_MAP;
  })
);

export const fetchSupplementaryFilesForExerciseStatus = createSelector(
  supplementaryFilesFetchManyStatusSelector,
  status => exerciseId => status.get(fetchSupplementaryFilesForExerciseEndpoint(exerciseId))
);
