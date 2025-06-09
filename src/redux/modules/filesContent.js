import { handleActions } from 'redux-actions';
import {
  initialState,
  isLoading,
  getJsData,
  defaultNeedsRefetching,
  resourceStatus,
  createRecord,
} from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware.js';
import { getFilesContent } from '../selectors/files.js';
import { urlQueryString } from '../../helpers/common.js';

const actionTypes = {
  FETCH: 'recodex/filesContent/FETCH',
  FETCH_PENDING: 'recodex/filesContent/FETCH_PENDING',
  FETCH_FULFILLED: 'recodex/filesContent/FETCH_FULFILLED',
  FETCH_REJECTED: 'recodex/filesContent/FETCH_REJECTED',
};

const archivedPromises = {};

// The similarSolutionId is a ACL-check requirement if content is fetched because a likely plagiarism is detected
// (similarSolutionId is the ID of the source/main solution accessible by current user)
export const fetchContentIfNeeded =
  (id, entry = null, similarSolutionId = null) =>
  (dispatch, getState) => {
    const key = id + (entry || '');
    const item = getFilesContent(id, entry)(getState());

    if (defaultNeedsRefetching(item)) {
      archivedPromises[key] = dispatch(
        createApiAction({
          type: actionTypes.FETCH,
          endpoint: `/uploaded-files/${id}/content?` + urlQueryString({ entry, similarSolutionId }),
          method: 'GET',
          meta: { key },
        })
      );
    }

    return isLoading(item)
      ? archivedPromises[key]
      : Promise.resolve({
          value: getJsData(item),
        });
  };

const reducer = handleActions(
  {
    [actionTypes.FETCH_PENDING]: (state, { meta: { key } }) => state.setIn(['resources', key], createRecord()),

    [actionTypes.FETCH_REJECTED]: (state, { meta: { key } }) =>
      state.setIn(['resources', key], createRecord({ state: resourceStatus.FAILED })),

    [actionTypes.FETCH_FULFILLED]: (state, { meta: { key }, payload: data }) =>
      state.setIn(['resources', key], createRecord({ state: resourceStatus.FULFILLED, data })),
  },
  initialState
);
export default reducer;
