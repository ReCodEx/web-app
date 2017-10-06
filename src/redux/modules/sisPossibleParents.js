import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'sisPossibleParents';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: courseId =>
    `/extensions/sis/remote-courses/${courseId}/possible-parents`
});

/**
 * Actions & reducer
 */

export const fetchSisPossibleParentsIfNeeded = actions.fetchOneIfNeeded;

const reducer = handleActions(
  Object.assign({}, reduceActions, {}),
  initialState
);

export default reducer;
