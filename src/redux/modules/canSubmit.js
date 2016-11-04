import { createAction, handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'canSubmit';
const {
  actions,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: (assignmentId) =>
    `/exercise-assignments/${assignmentId}/can-submit`
});

export const canSubmit = actions.fetchOneIfNeeded;

const reducer = handleActions(reduceActions, initialState);
export default reducer;
