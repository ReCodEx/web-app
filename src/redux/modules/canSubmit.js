import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { actionTypes as assignmentActionTypes } from './assignments';

/**
 * Create actions & reducer
 */

const resourceName = 'canSubmit';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: assignmentId => `/exercise-assignments/${assignmentId}/can-submit`,
});

export const canSubmit = actions.fetchResource;

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [assignmentActionTypes.UPDATE_FULFILLED]: (state, { meta: { id } }) => {
      return state.removeIn(['resources', id]);
    },
  }),
  initialState
);

export default reducer;
