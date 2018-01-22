import { createSelector, defaultMemoize } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { getExercise } from './exercises';

const getSupplementaryFiles = state => state.supplementaryFiles;
export const getSupplementaryFile = id =>
  createSelector(getSupplementaryFiles, supplementaryFiles =>
    supplementaryFiles.get(id)
  );

export const supplementaryFilesSelector = state =>
  state.supplementaryFiles.get('resources');

export const createGetSupplementaryFiles = ids =>
  createSelector(supplementaryFilesSelector, supplementaryFiles =>
    supplementaryFiles
      .filter(isReady)
      .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
  );

export const getSupplementaryFilesForExercise = defaultMemoize(exerciseId =>
  createSelector(
    [getExercise(exerciseId), supplementaryFilesSelector],
    (exercise, supplementaryFiles) => {
      const ids = exercise && exercise.getIn(['data', 'supplementaryFilesIds']);
      return (
        ids &&
        supplementaryFiles &&
        supplementaryFiles
          .filter(isReady)
          .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
      );
    }
  )
);
