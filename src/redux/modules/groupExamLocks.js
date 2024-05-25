import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'groupExamLocks';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/groups/${id}`, // its a hack, id is expected to be <groupId>/exam/<examId>
});

export const fetchGroupExamLocksIfNeeded = (groupId, examId) => actions.fetchOneIfNeeded(`${groupId}/exam/${examId}`);

const reducer = handleActions(Object.assign({}, reduceActions, {}), initialState);

export default reducer;
