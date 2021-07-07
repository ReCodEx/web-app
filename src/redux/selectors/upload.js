import { createSelector } from 'reselect';
import { EMPTY_MAP } from '../../helpers/common';

const getFiles = state => state.upload;

const getParam = (state, id) => id;

export const uploadingFilesSelector = createSelector([getFiles, getParam], (state, id) =>
  Object.values(state.getIn([id, 'uploading'], EMPTY_MAP).toJS())
);

export const isUploadCanceledByRequest = createSelector(
  [getFiles, getParam],
  (state, id) => fileName => state.getIn([id, 'uploading', fileName, 'cancelRequested'], false)
);

export const uploadedFilesSelector = createSelector([getFiles, getParam], (state, id) =>
  Object.values(state.getIn([id, 'uploaded'], EMPTY_MAP).toJS())
);

export const failedUploadFilesSelector = createSelector([getFiles, getParam], (state, id) =>
  Object.values(state.getIn([id, 'failed'], EMPTY_MAP).toJS())
);

export const removedUploadFilesSelector = createSelector([getFiles, getParam], (state, id) =>
  Object.values(state.getIn([id, 'removed'], EMPTY_MAP).toJS())
);

export const allFilesUploadedSelector = createSelector(
  [getFiles, getParam],
  (state, id) =>
    state.getIn([id, 'uploaded'], EMPTY_MAP).size > 0 && // at least one file uploaded
    state.getIn([id, 'uploading'], EMPTY_MAP).size === 0 && // no pending uploads
    state.getIn([id, 'failed'], EMPTY_MAP).size === 0 // and no failures
);
