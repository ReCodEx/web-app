import { handleActions } from 'redux-actions';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'plagiarisms';
const { actionTypes, actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/plagiarism/${id}`, // its a hack, id is expected to be batchId/solutionId
});

export const fetchPlagiarismsIfNeeded = (batchId, solutionId) => actions.fetchOneIfNeeded(`${batchId}/${solutionId}`);

const groupByAuthors = data => {
  const res = {};
  data.forEach(record => {
    res[record.authorId] = [...(res[record.authorId] || []), record];
  });
  return res;
};

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.FETCH_FULFILLED]: (state, { meta: { id }, payload }) =>
      state.setIn(['resources', id], createRecord({ state: resourceStatus.FULFILLED, data: groupByAuthors(payload) })),
  }),
  initialState
);

export default reducer;
