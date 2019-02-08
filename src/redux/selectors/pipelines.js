import { createSelector } from 'reselect';
import { fetchManyEndpoint } from '../modules/pipelines';
import { unique } from '../../helpers/common';
import { runtimeEnvironmentSelector } from './runtimeEnvironments';

const getPipelines = state => state.pipelines;
const getResources = pipelines => pipelines.get('resources');

export const fetchManyStatus = createSelector(
  getPipelines,
  state => state.getIn(['fetchManyStatus', fetchManyEndpoint])
);

export const pipelinesSelector = createSelector(
  getPipelines,
  getResources
);
export const pipelineSelector = pipelineId =>
  createSelector(
    pipelinesSelector,
    pipelines => pipelines.get(pipelineId)
  );

export const getPipeline = id =>
  createSelector(
    getPipelines,
    pipelines => pipelines.getIn(['resources', id])
  );

export const getFork = (id, forkId) =>
  createSelector(
    getPipeline(id),
    pipeline => pipeline.getIn(['data', 'forks', forkId])
  );

/* TODO - reconstruction required (pipelines will be modified to support many-to-many relation with exercises)
export const exercisePipelinesSelector = exerciseId =>
  createSelector([pipelinesSelector], pipelines =>
    pipelines
      .filter(isReady)
      .filter(pipeline => pipeline.toJS().data.exerciseId === exerciseId)
  );
*/

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
  createSelector(
    [getPipeline(id), runtimeEnvironmentSelector],
    (pipeline, envSelector) => {
      const envIds =
        pipeline && pipeline.getIn(['data', 'runtimeEnvironmentIds']);
      return envIds && envSelector ? envIds.toArray().map(envSelector) : null;
    }
  );
