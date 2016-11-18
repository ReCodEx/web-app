import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'supplementaryFiles';
const {
  actions,
  reduceActions
} = factory({ resourceName });

/**
 * Actions
 */

export const fetchSupplementaryFilesForExercise = (exerciseId) =>
  actions.fetchMany({
    endpoint: `/exercises/${exerciseId}/supplementary-files`
  });

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {
}), initialState);

export default reducer;
