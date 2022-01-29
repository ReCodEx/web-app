import { createSelector } from 'reselect';
import { fetchManyEndpoint } from '../modules/pipelines';
import { unique } from '../../helpers/common';
import { runtimeEnvironmentSelector } from './runtimeEnvironments';

const getPipelines = state => state.pipelines;
const getResources = pipelines => pipelines.get('resources');
const getParam = (_, id) => id;

export const fetchManyStatus = createSelector(getPipelines, state =>
  state.getIn(['fetchManyStatus', fetchManyEndpoint])
);

export const pipelinesSelector = createSelector(getPipelines, getResources);
export const pipelineSelector = pipelineId => createSelector(pipelinesSelector, pipelines => pipelines.get(pipelineId));

export const getPipeline = id => createSelector(getPipelines, pipelines => pipelines.getIn(['resources', id]));

export const getPipelinesEnvironmentsWhichHasEntryPoint = createSelector(
  pipelinesSelector,
  pipelines =>
    pipelines &&
    unique(
      pipelines
        .map(p => p.get('data'))
        .filter(p => p && p.getIn(['parameters', 'hasEntryPoint']))
        .map(p => p.get('runtimeEnvironmentIds'))
        .reduce((acc, envs) => acc.concat(envs.toJS()), [])
    )
);

export const pipelineEnvironmentsSelector = id =>
  createSelector([getPipeline(id), runtimeEnvironmentSelector], (pipeline, envSelector) => {
    const envIds = pipeline && pipeline.getIn(['data', 'runtimeEnvironmentIds']);
    return envIds && envSelector ? envIds.toArray().map(envSelector) : null;
  });

export const getPipelineExercises = createSelector([pipelinesSelector, getParam], (pipelines, id) =>
  pipelines.getIn([id, 'exercises'])
);
