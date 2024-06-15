import { createSelector, lruMemoize } from 'reselect';
import { EMPTY_MAP } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';
import { getExercise } from './exercises';

export const attachmentFilesSelector = state => state.attachmentFiles.get('resources');

export const getAttachmentFilesForExercise = lruMemoize(exerciseId =>
  createSelector([getExercise(exerciseId), attachmentFilesSelector], (exercise, attachmentFiles) => {
    const ids = exercise && exercise.getIn(['data', 'attachmentFilesIds']);
    return ids && attachmentFiles
      ? attachmentFiles.filter(isReady).filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
      : EMPTY_MAP;
  })
);
