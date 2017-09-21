import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as pipelineFilesActionTypes } from './pipelineFiles';

const resourceName = 'pipelines';
const { actions, reduceActions } = factory({ resourceName });

export const additionalActionTypes = {
  VALIDATE_PIPELINE: 'recodex/pipelines/VALIDATE_PIPELINE',
  FORK_PIPELINE: 'recodex/pipelines/FORK_PIPELINE',
  FORK_PIPELINE_PENDING: 'recodex/pipelines/FORK_PIPELINE_PENDING',
  FORK_PIPELINE_REJECTED: 'recodex/pipelines/FORK_PIPELINE_REJECTED',
  FORK_PIPELINE_FULFILLED: 'recodex/pipelines/FORK_PIPELINE_FULFILLED'
};

export const fetchPipelinesIfNeeded = actions.fetchIfNeeded;
export const fetchPipeline = actions.fetchResource;
export const fetchPipelineIfNeeded = actions.fetchOneIfNeeded;

export const fetchPipelines = () =>
  actions.fetchMany({
    endpoint: '/pipelines'
  });

export const fetchExercisePipelines = exerciseId =>
  actions.fetchMany({
    endpoint: `/exercises/${exerciseId}/pipelines`
  });

export const forkStatuses = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED'
};

export const forkPipeline = (id, forkId, exerciseId = null) =>
  createApiAction({
    type: additionalActionTypes.FORK_PIPELINE,
    endpoint: `/pipelines/${id}/fork`,
    method: 'POST',
    meta: { id, forkId },
    body: { exerciseId }
  });

export const create = actions.addResource;
export const editPipeline = actions.updateResource;
export const deletePipeline = actions.removeResource;

export const validatePipeline = (id, version) =>
  createApiAction({
    type: additionalActionTypes.VALIDATE_PIPELINE,
    endpoint: `/pipelines/${id}/validate`,
    method: 'POST',
    body: { version }
  });

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [pipelineFilesActionTypes.ADD_FILES_FULFILLED]: (
      state,
      { payload: files, meta: { pipelineId } }
    ) =>
      state.hasIn(['resources', pipelineId])
        ? addFiles(state, pipelineId, files, 'supplementaryFilesIds')
        : state,

    [additionalActionTypes.FORK_PIPELINE_PENDING]: (
      state,
      { meta: { id, forkId } }
    ) =>
      state.updateIn(['resources', id, 'data'], pipeline => {
        if (!pipeline.has('forks')) {
          pipeline = pipeline.set('forks', new Map());
        }

        return pipeline.update('forks', forks =>
          forks.set(forkId, { status: forkStatuses.PENDING })
        );
      }),

    [additionalActionTypes.FORK_PIPELINE_REJECTED]: (
      state,
      { meta: { id, forkId } }
    ) =>
      state.setIn(['resources', id, 'data', 'forks', forkId], {
        status: forkStatuses.REJECTED
      }),

    [additionalActionTypes.FORK_PIPELINE_FULFILLED]: (
      state,
      { payload: { id: pipelineId }, meta: { id, forkId } }
    ) =>
      state.setIn(['resources', id, 'data', 'forks', forkId], {
        status: forkStatuses.FULFILLED,
        pipelineId
      })
  }),
  initialState
);

const addFiles = (state, pipelineId, files, field) =>
  state.updateIn(['resources', pipelineId, 'data', field], list =>
    list.push(...files.map(file => file.id))
  );

export default reducer;
