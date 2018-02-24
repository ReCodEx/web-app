import { createSelector, defaultMemoize } from 'reselect';

import { EMPTY_MAP } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';
import { getExercise } from './exercises';

export const supplementaryFilesSelector = state =>
  state.supplementaryFiles.get('resources');

export const getSupplementaryFilesForExercise = defaultMemoize(exerciseId =>
  createSelector(
    [getExercise(exerciseId), supplementaryFilesSelector],
    (exercise, supplementaryFiles) => {
      const ids = exercise && exercise.getIn(['data', 'supplementaryFilesIds']);
      return ids && supplementaryFiles
        ? supplementaryFiles
            .filter(isReady)
            .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
        : EMPTY_MAP;
    }
  )
);
