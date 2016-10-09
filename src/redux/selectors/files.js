import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

export const getFiles = state => state.files;

export const getFile = id =>
  createSelector(
    getFiles,
    files => files.getIn(['resources', id])
  );

export const getContent = id =>
  createSelector(
    getFiles,
    files => files.getIn(['content', id, 'data'])
  );


export const getSourceCode = id =>
  createSelector(
    [ getFile(id), getContent(id) ],
    (file, content) => isReady(file) ? file.setIn(['data', 'content'], content) : null
  );
