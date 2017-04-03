import { expect } from 'chai';
import { fromJS } from 'immutable';

import reducer, { additionalActionTypes, forkExercise, forkStatuses } from '../../../src/redux/modules/exercises';

describe('exercises', () => {
  describe.only('forking', () => {
    const id = 'abcde';
    const forkId = 'edcba';
    const initialState = fromJS({
      resources: {
        [id]: {
          data: {
          }
        }
      }
    });

    it('must start a fork API action', () => {
      const action = forkExercise(id, forkId);
      expect(action.request).to.eql({
        type: additionalActionTypes.FORK_EXERCISE,
        endpoint: `/exercises/${id}/fork`,
        method: 'POST',
        meta: { id, forkId }
      });
    });

    it('must start tracking progress of forking', () => {
      const action = { type: additionalActionTypes.FORK_EXERCISE_PENDING, meta: { id, forkId } };
      let state = reducer(initialState, action);
      const fork = state.getIn(['resources', id, 'data', 'forks', forkId]);
      expect(fork).to.eql({ status: forkStatuses.PENDING });

      const action2 = { type: additionalActionTypes.FORK_EXERCISE_PENDING, meta: { id, forkId: 'xxx' } };
      state = reducer(state, action2);
      const forks = state.getIn(['resources', id, 'data', 'forks']);
      expect(forks.size).to.equal(2);
    });
  });
});
