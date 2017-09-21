import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as pipelineFilesActionTypes } from './pipelineFiles';

const resourceName = 'pipelines';
const { actions, reduceActions } = factory({ resourceName });

export const additionalActionTypes = {
  VALIDATE_PIPELINE: 'recodex/pipelines/VALIDATE_PIPELINE'
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
        : state
  }),
  initialState
);

const addFiles = (state, pipelineId, files, field) =>
  state.updateIn(['resources', pipelineId, 'data', field], list =>
    list.push(...files.map(file => file.id))
  );

export default reducer;
