import { handleActions } from 'redux-actions';
import { actionTypes } from './exercises';

const initialState = {};

const isGroupExercisesAction = ({ meta: { endpoint } }) =>
  /^\/groups\/[a-zA-Z0-9-]+\/exercises/.test(endpoint);

const extractGroupIdFromTheEndpoint = endpoint => {
  const matches = /^\/groups\/([a-zA-Z0-9-]+)\/exercises/.exec(endpoint);
  if (matches.length !== 1) {
    // ???
  }

  return matches[1];
};

const reducer = handleActions(
  {
    [actionTypes.FETCH_MANY_FULFILLED]: (state, action) => {
      if (!isGroupExercisesAction(action)) {
        return state;
      }

      const groupId = extractGroupIdFromTheEndpoint(action.meta.endpoint);
      const exerciseIds = action.payload.map(exercise => exercise.id);
      const oldExerciseIds = state[groupId] || [];
      const ids = [...oldExerciseIds, ...exerciseIds];

      return {
        ...state,
        [groupId]: Array.from(new Set(ids)),
      };
    },
  },
  initialState
);

export default reducer;
