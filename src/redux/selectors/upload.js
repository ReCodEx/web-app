import { createSelector } from 'reselect';

const getFiles = state => state.upload;

export const createGetUploadingFiles = id =>
  createSelector(getFiles, state => state.getIn([id, 'uploading']));
export const createGetUploadedFiles = id =>
  createSelector(getFiles, state => state.getIn([id, 'uploaded']));
export const createGetFailedFiles = id =>
  createSelector(getFiles, state => state.getIn([id, 'failed']));
export const createGetRemovedFiles = id =>
  createSelector(getFiles, state => state.getIn([id, 'removed']));
export const createAllUploaded = id =>
  createSelector(
    [
      createGetUploadingFiles(id),
      createGetUploadedFiles(id),
      createGetFailedFiles(id)
    ],
    (uploading, uploaded, failed) =>
      uploading &&
      uploading.size === 0 &&
      uploaded &&
      uploaded.size > 0 &&
      failed &&
      failed.size === 0
  );
