import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

const getPipelineFiles = state => state.pipelineFiles;
export const getPipelineFile = id =>
  createSelector(getPipelineFiles, pipelineFiles => pipelineFiles.get(id));

export const pipelineFilesSelector = state =>
  state.pipelineFiles.get('resources');

export const createGetPipelineFiles = ids =>
  createSelector(pipelineFilesSelector, pipelineFiles =>
    pipelineFiles
      .filter(isReady)
      .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
  );
