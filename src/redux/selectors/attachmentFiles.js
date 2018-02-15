import { createSelector, defaultMemoize } from 'reselect';
import { Map } from 'immutable';
import { isReady } from '../helpers/resourceManager';
import { getExercise } from './exercises';

const EMPTY_MAP = Map();

export const attachmentFilesSelector = state =>
  state.attachmentFiles.get('resources');

export const getAttachmentFilesForExercise = defaultMemoize(exerciseId =>
  createSelector(
    [getExercise(exerciseId), attachmentFilesSelector],
    (exercise, attachmentFiles) => {
      const ids = exercise && exercise.getIn(['data', 'attachmentFilesIds']);
      return ids && attachmentFiles
        ? attachmentFiles
            .filter(isReady)
            .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
        : EMPTY_MAP;
    }
  )
);
