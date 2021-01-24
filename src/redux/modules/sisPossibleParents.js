import { handleActions } from 'redux-actions';
import factory, { initialState, createRecord, resourceStatus } from '../helpers/resourceManager';

const resourceName = 'sisPossibleParents';
const { actionTypes, actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: courseId => `/extensions/sis/remote-courses/${courseId}/possible-parents`,
});

export { actionTypes };

/**
 * Actions & reducer
 */

export const fetchSisPossibleParentsIfNeeded = actions.fetchOneIfNeeded;

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.FETCH_FULFILLED]: (state, { payload, meta: { id } }) =>
      state.setIn(
        ['resources', id],
        createRecord({ state: resourceStatus.FULFILLED, data: payload.map(group => group.id) })
      ),
  }),
  initialState
);

export default reducer;
