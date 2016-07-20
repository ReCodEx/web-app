import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const expect = chai.expect;

import fetchMock from 'fetch-mock';
import { API_BASE } from '../../../src/redux/api';
import reducer, { actionTypes, statusTypes, logout, login } from '../../../src/redux/modules/auth';

describe('Authentication', () => {

  describe('(Action creators)', () => {

    it('must create a valid logout action and remove the stored access token', () => {
      const action = logout();
      expect(action).to.eql({
        type: actionTypes.LOGOUT
      });
    });

    it('must create correct login request action', (done) => {
      const email = 'X@Y.Z';
      const password = 'ZZZZZZZZZZ';
      const thunk = login(email, password);

      expect(thunk).to.be.a('function');
      expect(thunk.length).to.equal(2);

      // ----------------\
      // @todo update when the final API is ready
      const resp = {
        accessToken: 'xyz',
        user: {
          firstName: 'X',
          lastName: 'Y',
          email: 'X@Y.Z'
        }
      };
      fetchMock.mock(`${API_BASE}/login?email=${email}&password=${password}`, 'GET', [resp]);
      // ----------------/

      const dispatch = (action) => action;
      const getState = () => ({ auth: {} });
      const action = thunk(dispatch, getState);

      expect(action.type).to.equal(actionTypes.LOGIN);
      expect(action.payload).to.be.an('object');
      expect(Object.keys(action).length).to.equal(2);
      expect(action.payload.promise.then).to.be.a('function');

      action.payload.promise
        .then(json => {
          expect(json).to.eql(resp);
          done();
        })
        .catch(err => done(err));
    });

  });

});
