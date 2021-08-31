import { createSelector } from 'reselect';

export const getFiles = state => state.files;

export const getFile = id => createSelector(getFiles, files => files.getIn(['resources', id]));

const getContent = state => state.filesContent;

export const getFilesContent = (id, entry = null) =>
  createSelector(getContent, files => files.getIn(['resources', id + (entry || '')]));
