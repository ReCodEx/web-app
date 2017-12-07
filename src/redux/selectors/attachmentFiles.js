import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

const getAttachmentExerciseFiles = state => state.attachmentExerciseFiles;
export const getAttachmentExerciseFile = id =>
  createSelector(getAttachmentExerciseFiles, attachmentExerciseFiles =>
    attachmentExerciseFiles.get(id)
  );

export const attachmentExerciseFilesSelector = state =>
  state.attachmentExerciseFiles.get('resources');

export const createGetAttachmentExerciseFiles = ids =>
  createSelector(attachmentExerciseFilesSelector, attachmentExerciseFiles =>
    attachmentExerciseFiles
      .filter(isReady)
      .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
  );
