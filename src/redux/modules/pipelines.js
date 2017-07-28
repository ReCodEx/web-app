import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'pipelines';
const { actions, reduceActions } = factory({ resourceName });

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

const reducer = handleActions(
  Object.assign({}, reduceActions, {}),
  initialState
);

export default reducer;
