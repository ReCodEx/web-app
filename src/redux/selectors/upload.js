import { createSelector } from 'reselect';
import { EMPTY_LIST } from '../../helpers/common';

const getFiles = state => state.upload;

export const createGetUploadingFiles = id =>
  createSelector(getFiles, state =>
    state.getIn([id, 'uploading'], EMPTY_LIST).toJS()
  );

export const createGetUploadedFiles = id =>
  createSelector(getFiles, state =>
    state.getIn([id, 'uploaded'], EMPTY_LIST).toJS()
  );

export const createGetFailedFiles = id =>
  createSelector(getFiles, state =>
    state.getIn([id, 'failed'], EMPTY_LIST).toJS()
  );

export const createGetRemovedFiles = id =>
  createSelector(getFiles, state =>
    state.getIn([id, 'removed'], EMPTY_LIST).toJS()
  );

export const createAllUploaded = id =>
  createSelector(
    [
      createGetUploadingFiles(id),
      createGetUploadedFiles(id),
      createGetFailedFiles(id)
    ],
    (uploading, uploaded, failed) =>
      Boolean(
        uploading &&
          uploading.length === 0 &&
          uploaded &&
          uploaded.length > 0 &&
          failed &&
          failed.length === 0
      )
  );
