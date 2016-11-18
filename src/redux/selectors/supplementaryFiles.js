import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

const getSupplementaryFiles = state => state.supplementaryFiles;
export const getSupplementaryFile = (id) =>
  createSelector(
    getSupplementaryFiles,
    supplementaryFiles => supplementaryFiles.get(id)
  );

export const supplementaryFilesSelector = state => state.supplementaryFiles.get('resources');

export const createGetSupplementaryFilesForExercise = (exerciseId) =>
  createSelector(
    supplementaryFilesSelector,
    supplementaryFiles => supplementaryFiles.filter(isReady).filter(file => file.getIn(['data', 'exerciseId']) === exerciseId)
  );
