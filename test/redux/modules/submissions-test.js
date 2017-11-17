import { expect } from 'chai';
import { fromJS } from 'immutable';

import reducer, {
  additionalActionTypes,
  acceptSubmission
} from '../../../src/redux/modules/submissions';

describe('Submissions', () => {
  describe('Mark as accepted', () => {
    it('must create propper API action', () => {
      const id = 'abc';

      const action = acceptSubmission(id);

      expect(action.request).to.eql({
        type: additionalActionTypes.ACCEPT,
        method: 'POST',
        endpoint: `/assignment-solutions/${id}/set-accepted`,
        meta: { id }
      });
    });

    it('must process the lifecycle actions correctly', () => {
      const id = 'abcde123';
      const initialState = fromJS({
        resources: { [id]: { status: 'FULFILLED', data: { accepted: false } } }
      });

      const pendingAction = {
        type: additionalActionTypes.ACCEPT_PENDING,
        meta: { id }
      };

      const pendingState = reducer(initialState, pendingAction);
      expect(
        pendingState.getIn(['resources', id, 'data', 'accepted'])
      ).to.equal(false);
      expect(
        pendingState.getIn(['resources', id, 'data', 'accepted-pending'])
      ).to.equal(true);

      const failedAction = {
        type: additionalActionTypes.ACCEPT_FAILED,
        meta: { id }
      };

      const failedState = reducer(pendingState, failedAction);
      expect(failedState.getIn(['resources', id, 'data', 'accepted'])).to.equal(
        false
      );
      expect(
        failedState.getIn(['resources', id, 'data', 'accepted-pending'])
      ).to.equal(false);

      const successAction = {
        type: additionalActionTypes.ACCEPT_FULFILLED,
        meta: { id }
      };

      const successState = reducer(pendingState, successAction);
      expect(
        successState.getIn(['resources', id, 'data', 'accepted'])
      ).to.equal(true);
    });

    it('must remove all other accepted flags when it succeeds', () => {
      const id = 'abcde123';
      const id2 = `__${id}`;
      const id3 = `__${id2}`;
      const pendingState = fromJS({
        resources: {
          [id]: { status: 'FULFILLED', data: { accepted: false } },
          [id2]: { status: 'FULFILLED', data: { accepted: true } },
          [id3]: { status: 'FULFILLED', data: { accepted: true } }
        }
      });

      const successAction = {
        type: additionalActionTypes.ACCEPT_FULFILLED,
        meta: { id }
      };

      const successState = reducer(pendingState, successAction);
      expect(
        successState.getIn(['resources', id, 'data', 'accepted'])
      ).to.equal(true);
      expect(
        successState.getIn(['resources', id2, 'data', 'accepted'])
      ).to.equal(false);
      expect(
        successState.getIn(['resources', id3, 'data', 'accepted'])
      ).to.equal(false);
    });
  });
});
