import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { fetchManyEndpoint } from '../modules/pipelines';

const getPipelines = state => state.pipelines;
const getResources = pipelines => pipelines.get('resources');

export const fetchManyStatus = createSelector(getPipelines, state =>
  state.getIn(['fetchManyStatus', fetchManyEndpoint])
);

export const pipelinesSelector = createSelector(getPipelines, getResources);
export const pipelineSelector = pipelineId =>
  createSelector(pipelinesSelector, pipelines => pipelines.get(pipelineId));

export const getPipeline = id =>
  createSelector(getPipelines, pipelines => pipelines.getIn(['resources', id]));

export const getFork = (id, forkId) =>
  createSelector(getPipeline(id), pipeline =>
    pipeline.getIn(['data', 'forks', forkId])
  );

export const exercisePipelinesSelector = exerciseId =>
  createSelector([pipelinesSelector], pipelines =>
    pipelines
      .filter(isReady)
      .filter(pipeline => pipeline.toJS().data.exerciseId === exerciseId)
  );
