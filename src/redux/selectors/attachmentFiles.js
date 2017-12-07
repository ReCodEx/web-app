import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

const getAttachmentFiles = state => state.attachmentFiles;
export const getAttachmentFile = id =>
  createSelector(getAttachmentFiles, attachmentFiles =>
    attachmentFiles.get(id)
  );

export const attachmentFilesSelector = state =>
  state.attachmentFiles.get('resources');

export const createGetAttachmentFiles = ids =>
  createSelector(attachmentFilesSelector, attachmentFiles =>
    attachmentFiles
      .filter(isReady)
      .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
  );
