import { expect } from 'chai';
import { isValidRSAA, CALL_API } from 'redux-api-middleware';
import { LOCAL_STORAGE_KEY, API_BASE } from '../../../src/redux/api';
import reducer, { actionTypes, statusTypes, logout, login } from '../../../src/redux/modules/auth';

describe('Authentication', () => {

  beforeEach(function () {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  });

  describe('(Action creators)', () => {

    it('must create a valid logout action and remove the stored access token', () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'abc');
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal('abc');
      const action = logout();
      expect(action).to.eql({
        type: actionTypes.LOGOUT
      });
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal(null);
    });

    it('must create correct RSAA for login request', () => {
      const email = 'X@Y.Z';
      const password = 'ZZZZZZZZZZ';
      const action = login(email, password);
      expect(isValidRSAA(action)).to.equal(true);
    });

    it('must create correct login request action for the redux-api-middleware', () => {
      const email = 'X@Y.Z';
      const password = 'ZZZZZZZZZZ';
      const action = login(email, password);

      expect(action[CALL_API]).to.be.an('object');
      expect(action[CALL_API].endpoint).to.equal(API_BASE + `/login?email=${email}&password=${password}`); // @todo: refactor
      expect(action[CALL_API].method).to.equal('get'); // @todo: this will change to post
      expect(action[CALL_API].body).to.equal(undefined);
      expect(action[CALL_API].headers).to.eql({});
      expect(action[CALL_API].types).to.be.an('array');
      expect(action[CALL_API].types.length).to.equal(3);
      expect(action[CALL_API].types[0]).to.equal(actionTypes.LOGIN_REQUEST);
      expect(action[CALL_API].types[1]).to.be.an('object');
      expect(action[CALL_API].types[1].type).to.equal(actionTypes.LOGIN_SUCCESS);
      expect(action[CALL_API].types[1].payload).to.be.a('function');
      expect(action[CALL_API].types[1].payload.length).to.equal(3);
      expect(action[CALL_API].types[2]).to.equal(actionTypes.LOGIN_FAILIURE);
    });

  });

});
