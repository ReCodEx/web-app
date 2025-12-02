import { handleActions } from 'redux-actions';
import { List, fromJS } from 'immutable';
import factory, {
  initialState,
  createRecord,
  resourceStatus,
  createActionsWithPostfixes,
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware.js';

import { actionTypes as pipelineFilesActionTypes } from './pipelineFiles.js';
import { actionTypes as paginationActionTypes, fetchPaginated } from './pagination.js';

import { arrayToObject } from '../../helpers/common.js';

const resourceName = 'pipelines';
const { actions, reduceActions } = factory({ resourceName });

export const additionalActionTypes = {
  VALIDATE_PIPELINE: 'recodex/pipelines/VALIDATE_PIPELINE',
  ...createActionsWithPostfixes('FORK_PIPELINE', 'recodex/pipelines'),
  ...createActionsWithPostfixes('SET_ENVIRONMENTS', 'recodex/pipelines'),
  ...createActionsWithPostfixes('FETCH_PIPELINE_EXERCISES', 'recodex/pipelines'),
};

export const fetchPipeline = actions.fetchResource;
export const fetchPipelineIfNeeded = actions.fetchOneIfNeeded;
export const reloadPipeline = (id, meta = {}) => actions.fetchResource(id, { allowReload: true, ...meta });

export const fetchManyEndpoint = '/pipelines';

export const fetchPipelines = () =>
  fetchPaginated(null, 'pipelines')(
    null, // no special locale
    0, // from index 0
    0, // limit = 0 means all
    true // force reload
  );

export const forkStatuses = {
  PENDING: 'PENDING',
  REJECTED: 'REJECTED',
  FULFILLED: 'FULFILLED',
};

export const forkPipeline = (id, forkId, formData = null) => {
  const actionData = {
    type: additionalActionTypes.FORK_PIPELINE,
    endpoint: `/pipelines/${id}/fork`,
    method: 'POST',
    meta: { id, forkId },
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
    body: { version },
  });

export const setPipelineRuntimeEnvironments = (id, environments) =>
  createApiAction({
    type: additionalActionTypes.SET_ENVIRONMENTS,
    endpoint: `/pipelines/${id}/runtime-environments`,
    method: 'POST',
    body: { environments },
  });

export const fetchPipelineExercises = id =>
  createApiAction({
    type: additionalActionTypes.FETCH_PIPELINE_EXERCISES,
    method: 'GET',
    endpoint: `/pipelines/${id}/exercises`,
    meta: { id },
  });

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [pipelineFilesActionTypes.ADD_FILES_FULFILLED]: (state, { payload: files, meta: { pipelineId } }) =>
      state.hasIn(['resources', pipelineId]) ? updateFiles(state, pipelineId, files, 'filesIds') : state,

    [additionalActionTypes.SET_ENVIRONMENTS_FULFILLED]: (state, { payload }) =>
      state.setIn(
        ['resources', payload.id],
        createRecord({
          data: payload,
          state: resourceStatus.FULFILLED,
          didInvalidate: false,
          lastUpdate: Date.now(),
        })
      ),

    // Pagination result needs to store entity data here whilst indices are stored in pagination module
    [paginationActionTypes.FETCH_PAGINATED_FULFILLED]: (state, { payload: { items }, meta: { endpoint } }) =>
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
                  lastUpdate: Date.now(),
                })
            )
          )
        : state,

    [additionalActionTypes.FETCH_PIPELINE_EXERCISES_PENDING]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'exercises'], resourceStatus.PENDING),

    [additionalActionTypes.FETCH_PIPELINE_EXERCISES_FULFILLED]: (state, { payload, meta: { id } }) =>
      state.setIn(['resources', id, 'exercises'], fromJS(payload)),

    [additionalActionTypes.FETCH_PIPELINE_EXERCISES_REJECTED]: (state, { meta: { id } }) =>
      state.setIn(['resources', id, 'exercises'], resourceStatus.REJECTED),
  }),
  initialState
);

const updateFiles = (state, pipelineId, files, field) =>
  state.updateIn(['resources', pipelineId, 'data', field], list => List(files.map(file => file.id)));

export default reducer;
