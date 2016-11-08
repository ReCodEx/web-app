import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

export const getFiles = state => state.files;

export const getFile = id =>
  createSelector(
    getFiles,
    files => files.getIn(['resources', id])
  );

const getContent = state => state.filesContent;

export const getFilesContent  = id =>
  createSelector(
    getContent,
    files => files.getIn(['resources', id])
  );
