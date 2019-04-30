import { expect } from 'chai';
import { fromJS } from 'immutable';

import reducer, { additionalActionTypes, acceptSolution } from '../../../src/redux/modules/solutions';

describe('Submissions', () => {
  describe('Mark as accepted', () => {
    it('must create propper API action', () => {
      const id = 'abc';

      const action = acceptSolution(id);

      expect(action.request).to.eql({
        type: additionalActionTypes.ACCEPT,
        method: 'POST',
        endpoint: `/assignment-solutions/${id}/set-accepted`,
        meta: { id },
      });
    });

    it('must process the lifecycle actions correctly', () => {
      const id = 'abcde123';
      const initialState = fromJS({
        resources: { [id]: { status: 'FULFILLED', data: { accepted: false } } },
      });

      const pendingAction = {
        type: additionalActionTypes.ACCEPT_PENDING,
        meta: { id },
      };

      const pendingState = reducer(initialState, pendingAction);
      expect(pendingState.getIn(['resources', id, 'data', 'accepted'])).to.equal(false);
      expect(pendingState.getIn(['resources', id, 'data', 'accepted-pending'])).to.equal(true);

      const failedAction = {
        type: additionalActionTypes.ACCEPT_REJECTED,
        meta: { id },
      };

      const failedState = reducer(pendingState, failedAction);
      expect(failedState.getIn(['resources', id, 'data', 'accepted'])).to.equal(false);
      expect(failedState.getIn(['resources', id, 'data', 'accepted-pending'])).to.equal(false);

      const successAction = {
        type: additionalActionTypes.ACCEPT_FULFILLED,
        meta: { id },
      };

      const successState = reducer(pendingState, successAction);
      expect(successState.getIn(['resources', id, 'data', 'accepted'])).to.equal(true);
    });

    it('must remove all other accepted flags when it succeeds', () => {
      const id = 'abcde123';
      const id2 = `__${id}`;
      const id3 = `__${id2}`;
      const userId = 'userID';
      const exerciseAssignmentId = 'assignmentId';
      const pendingState = fromJS({
        resources: {
          [id]: {
            status: 'FULFILLED',
            data: { id, accepted: false, isBestSolution: false, exerciseAssignmentId, solution: { userId } },
          },
          [id2]: {
            status: 'FULFILLED',
            data: { id: id2, accepted: true, isBestSolution: true, exerciseAssignmentId, solution: { userId } },
          },
          [id3]: {
            status: 'FULFILLED',
            data: { id: id3, accepted: true, isBestSolution: false, exerciseAssignmentId, solution: { userId } },
          },
        },
      });

      const successAction = {
        type: additionalActionTypes.ACCEPT_FULFILLED,
        meta: { id },
      };

      const successState = reducer(pendingState, successAction);
      expect(successState.getIn(['resources', id, 'data', 'accepted'])).to.equal(true);
      expect(successState.getIn(['resources', id, 'data', 'isBestSolution'])).to.equal(true);
      expect(successState.getIn(['resources', id2, 'data', 'accepted'])).to.equal(false);
      expect(successState.getIn(['resources', id2, 'data', 'isBestSolution'])).to.equal(false);
      expect(successState.getIn(['resources', id3, 'data', 'accepted'])).to.equal(false);
      expect(successState.getIn(['resources', id3, 'data', 'isBestSolution'])).to.equal(false);
    });
  });
});
