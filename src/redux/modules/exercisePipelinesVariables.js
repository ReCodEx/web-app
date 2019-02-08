import { handleActions } from 'redux-actions';
import { Map } from 'immutable';
import { createRecord, resourceStatus } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';

export const actionTypes = {
  FETCH: 'recodex/exercisePipelinesVariables/FETCH',
  FETCH_PENDING: 'recodex/exercisePipelinesVariables/FETCH_PENDING',
  FETCH_FULFILLED: 'recodex/exercisePipelinesVariables/FETCH_FULFILLED',
  FETCH_REJECTED: 'recodex/exercisePipelinesVariables/FETCH_REJECTED',
};

export const fetchExercisePipelinesVariables = (
  exerciseId,
  runtimeEnvironmentId,
  pipelinesIds
) =>
  createApiAction({
    type: actionTypes.FETCH,
    method: 'POST',
    endpoint: `/exercises/${exerciseId}/config/variables`,
    body: { runtimeEnvironmentId, pipelinesIds },
    meta: { exerciseId },
  });

const initialState = Map();
const reducer = handleActions(
  {
    [actionTypes.FETCH_PENDING]: (state, { meta: { exerciseId } }) =>
      state.getIn([exerciseId, 'state']) === resourceStatus.FULFILLED
        ? state.setIn([exerciseId, 'state'], resourceStatus.RELOADING)
        : state.set(exerciseId, createRecord()),

    [actionTypes.FETCH_FULFILLED]: (
      state,
      { payload: data, meta: { exerciseId } }
    ) =>
      state.set(
        exerciseId,
        createRecord({ state: resourceStatus.FULFILLED, data })
      ),

    [actionTypes.FETCH_REJECTED]: (state, { meta: { exerciseId } }) =>
      state.set(exerciseId, createRecord({ state: resourceStatus.FAILED })),
  },
  initialState
);
export default reducer;
