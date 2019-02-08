import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

export const actionTypes = {
  NEW_PENDING_FETCH_OPERATION: 'recodex/app/NEW_PENDING_FETCH_OPERATION',
  COMPLETED_FETCH_OPERATION: 'recodex/app/COMPLETED_FETCH_OPERATION',
};

const initialState = fromJS({
  pendingFetchOperations: 0,
});

export const newPendingFetchOperation = createAction(
  actionTypes.NEW_PENDING_FETCH_OPERATION
);
export const completedFetchOperation = createAction(
  actionTypes.COMPLETED_FETCH_OPERATION
);

export default handleActions(
  {
    [actionTypes.NEW_PENDING_FETCH_OPERATION]: state =>
      state.update(
        'pendingFetchOperations',
        pendingFetchOperations => pendingFetchOperations + 1
      ),
    [actionTypes.COMPLETED_FETCH_OPERATION]: state =>
      state.update(
        'pendingFetchOperations',
        pendingFetchOperations => pendingFetchOperations - 1
      ),
  },
  initialState
);
