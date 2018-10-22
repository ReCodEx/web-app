import { handleActions } from 'redux-actions';
import { Map, List } from 'immutable';
import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

import { actionTypes as pipelineFilesActionTypes } from './pipelineFiles';
import {
  actionTypes as paginationActionTypes,
  fetchPaginated
} from './pagination';

import { arrayToObject } from '../../helpers/common';

const resourceName = 'pipelines';
const { actions, reduceActions } = factory({ resourceName });

export const additionalActionTypes = {
  VALIDATE_PIPELINE: 'recodex/pipelines/VALIDATE_PIPELINE',
  FORK_PIPELINE: 'recodex/pipelines/FORK_PIPELINE',
  FORK_PIPELINE_PENDING: 'recodex/pipelines/FORK_PIPELINE_PENDING',
  FORK_PIPELINE_REJECTED: 'recodex/pipelines/FORK_PIPELINE_REJECTED',
  FORK_PIPELINE_FULFILLED: 'recodex/pipelines/FORK_PIPELINE_FULFILLED'
};

export const fetchPipeline = actions.fetchResource;
export const fetchPipelineIfNeeded = actions.fetchOneIfNeeded;

export const fetchManyEndpoint = '/pipelines';

export const fetchPipelines = () =>
  fetchPaginated(null, 'pipelines')(
    null, // no special locale
    0, // from index 0
    0, // limit = 0 means all
    true // force reload
  );

/* TODO - awaiting modification (many-to-many relation with exercises)
export const fetchExercisePipelines = exerciseId =>
  actions.fetchMany({
    endpoint: `/exercises/${exerciseId}/pipelines`
  });
*/

export const forkStatuses = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED'
};

export const forkPipeline = (id, forkId, formData = null) => {
  let actionData = {
    type: additionalActionTypes.FORK_PIPELINE,
    endpoint: `/pipelines/${id}/fork`,
    method: 'POST',
    meta: { id, forkId }
  };
  if (formData && formData.exerciseId) {
    actionData.body = { exerciseId: formData.exerciseId };
  }
  return createApiAction(actionData);
};

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
        ? updateFiles(state, pipelineId, files, 'supplementaryFilesIds')
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
      }),

    // Pagination result needs to store entity data here whilst indices are stored in pagination module
    [paginationActionTypes.FETCH_PAGINATED_FULFILLED]: (
      state,
      { payload: { items }, meta: { endpoint } }
    ) =>
      endpoint === 'pipelines'
        ? state.mergeIn(
            ['resources'],
            arrayToObject(
              items,
              obj => obj.id,
              data =>
                createRecord({
                  data,
                  state: resourceStatus.FULFILLED,
                  didInvalidate: false,
                  lastUpdate: Date.now()
                })
            )
          )
        : state
  }),
  initialState
);

const updateFiles = (state, pipelineId, files, field) =>
  state.updateIn(['resources', pipelineId, 'data', field], list =>
    List(files.map(file => file.id))
  );

export default reducer;
