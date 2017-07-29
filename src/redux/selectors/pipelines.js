import { createSelector } from 'reselect';

const getPipelines = state => state.pipelines;
const getResources = pipelines => pipelines.get('resources');

export const pipelinesSelector = createSelector(getPipelines, getResources);
export const pipelineSelector = pipelineId =>
  createSelector(pipelinesSelector, pipelines => pipelines.get(pipelineId));

export const getPipeline = id =>
  createSelector(getPipelines, pipelines => pipelines.getIn(['resources', id]));
