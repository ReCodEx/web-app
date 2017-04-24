import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

const getAdditionalExerciseFiles = state => state.additionalExerciseFiles;
export const getAdditionalExerciseFile = id =>
  createSelector(getAdditionalExerciseFiles, additionalExerciseFiles =>
    additionalExerciseFiles.get(id)
  );

export const additionalExerciseFilesSelector = state =>
  state.additionalExerciseFiles.get('resources');

export const createGetAdditionalExerciseFiles = ids =>
  createSelector(additionalExerciseFilesSelector, additionalExerciseFiles =>
    additionalExerciseFiles
      .filter(isReady)
      .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
  );
