import { expect } from 'chai';
import { fromJS } from 'immutable';

import reducer, { additionalActionTypes, setSolutionFlag } from '../../../src/redux/modules/solutions.js';

describe('Solutions', () => {
  describe('Mark as accepted', () => {
    it('must create propper API action', () => {
      const id = 'abc';

      const action = setSolutionFlag(id, 'accepted', true);

      expect(action.request).to.eql({
        type: additionalActionTypes.SET_FLAG,
        method: 'POST',
        endpoint: `/assignment-solutions/${id}/set-flag/accepted`,
        body: { value: true },
        meta: { id, flag: 'accepted', value: true },
      });
    });

    it('must process the lifecycle actions correctly', () => {
      const id = 'abcde123';
      const initialState = fromJS({
        resources: { [id]: { status: 'FULFILLED', data: { accepted: false } } },
      });

      const pendingAction = {
        type: additionalActionTypes.SET_FLAG_PENDING,
        meta: { id, flag: 'accepted', value: true },
      };

      const pendingState = reducer(initialState, pendingAction);
      expect(pendingState.getIn(['resources', id, 'data', 'accepted'])).to.equal(false);
      expect(pendingState.getIn(['resources', id, 'pending-set-flag-accepted'])).to.equal(true);

      const failedAction = {
        type: additionalActionTypes.SET_FLAG_REJECTED,
        meta: { id, flag: 'accepted', value: true },
      };

      const failedState = reducer(pendingState, failedAction);
      expect(failedState.getIn(['resources', id, 'data', 'accepted'])).to.equal(false);
      expect(failedState.getIn(['resources', id, 'pending-set-flag-accepted'])).to.equal(undefined);

      const successAction = {
        type: additionalActionTypes.SET_FLAG_FULFILLED,
        payload: { assignments: [] },
        meta: { id, flag: 'accepted', value: true },
      };

      const successState = reducer(pendingState, successAction);
      expect(successState.getIn(['resources', id, 'data', 'accepted'])).to.equal(true);
    });

    it('must remove all other accepted flags when it succeeds', () => {
      const id = 'abcde123';
      const id2 = `__${id}`;
      const id3 = `__${id2}`;
      const authorId = 'userID';
      const assignmentId = 'assignmentId';
      const pendingState = fromJS({
        resources: {
          [id]: {
            status: 'FULFILLED',
            data: { id, accepted: false, isBestSolution: false, assignmentId, authorId },
          },
          [id2]: {
            status: 'FULFILLED',
            data: { id: id2, accepted: true, isBestSolution: true, assignmentId, authorId },
          },
          [id3]: {
            status: 'FULFILLED',
            data: { id: id3, accepted: true, isBestSolution: false, assignmentId, authorId },
          },
        },
      });

      const successAction = {
        type: additionalActionTypes.SET_FLAG_FULFILLED,
        payload: { assignments: [] },
        meta: { id, flag: 'accepted', value: true },
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
