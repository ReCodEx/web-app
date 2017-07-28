import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

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
  Object.assign({}, reduceActions, {}),
  initialState
);

export default reducer;
