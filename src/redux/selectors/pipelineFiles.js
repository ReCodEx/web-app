import { createSelector, defaultMemoize } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { getPipeline } from './pipelines';
import { EMPTY_MAP } from '../../helpers/common';

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

export const getSupplementaryFilesForPipeline = defaultMemoize(pipelineId =>
  createSelector(
    [getPipeline(pipelineId), pipelineFilesSelector],
    (pipeline, pipelineFiles) => {
      const ids = pipeline && pipeline.getIn(['data', 'supplementaryFilesIds']);
      return ids && pipelineFiles
        ? pipelineFiles
            .filter(isReady)
            .filter(file => ids.indexOf(file.getIn(['data', 'id'])) >= 0)
        : EMPTY_MAP;
    }
  )
);
