import { handleActions } from 'redux-actions';
import factory, {
  initialState,
  createRecord,
  resourceStatus
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

const resourceName = 'pipelineFiles';
const { actions, reduceActions } = factory({ resourceName });

/**
 * Actions
 */

export const actionTypes = {
  ADD_FILES: 'recodex/pipelineFiles/ADD_FILES',
  ADD_FILES_PENDING: 'recodex/pipelineFiles/ADD_FILES_PENDING',
  ADD_FILES_FULFILLED: 'recodex/pipelineFiles/ADD_FILES_FULFILLED',
  ADD_FILES_REJECTED: 'recodex/pipelineFiles/ADD_FILES_REJECTED'
};

export const fetchSupplementaryFilesForPipeline = pipelineId =>
  actions.fetchMany({
    endpoint: `/pipelines/${pipelineId}/supplementary-files`
  });

export const addPipelineFiles = (pipelineId, files) =>
  createApiAction({
    type: actionTypes.ADD_FILES,
    endpoint: `/pipelines/${pipelineId}/supplementary-files`,
    method: 'POST',
    body: {
      files: files.map(uploaded => uploaded.file.id)
    },
    meta: {
      pipelineId,
      files: files.map(uploaded => ({
        tmpId: Math.random().toString(),
        file: uploaded.file
      }))
    },
    uploadFiles: true
  });

/**
 * Reducer
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.ADD_FILES_FULFILLED]: (state, { payload, meta: { files } }) =>
      payload.reduce(
        (state, data) =>
          state.setIn(
            ['resources', data.id],
            createRecord({ data, state: resourceStatus.FULFILLED })
          ),
        state
      )
  }),
  initialState
);

export default reducer;
