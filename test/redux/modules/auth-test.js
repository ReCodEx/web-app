import chai from 'chai';
import spies from 'chai-spies';
import { fromJS } from 'immutable';

chai.use(spies);
const expect = chai.expect;

import fetchMock from 'fetch-mock';
import reducerFactory, {
  actionTypes,
  statusTypes,
  logout,
  login,
  loginServices
} from '../../../src/redux/modules/auth';
import {
  isLoggedIn,
  hasSucceeded,
  hasFailed,
  statusSelector
} from '../../../src/redux/selectors/auth';

import decodeJwt from 'jwt-decode';

describe('Authentication', () => {
  describe.skip('(Action creators)', () => {
    it('must create a valid logout action and remove the stored access token', () => {});

    it('must create correct login request action', () => {});
  });

  describe('(Reducer)', () => {
    describe('Initial state', () => {
      it('must return LOGGED OUT initial state with no access token given', () => {
        const reducer = reducerFactory(null); // no access token
        const state = reducer(undefined, {});
        const expectedState = fromJS({
          status: {},
          jwt: null,
          accessToken: null,
          userId: null
        });
        expect(state).to.eql(expectedState);
      });

      it('must return LOGGED OUT initial state when an invalid access token is given', () => {
        const reducer = reducerFactory('abcde'); // invalid access token
        const state = reducer(undefined, {});
        const expectedState = fromJS({
          status: {},
          jwt: null,
          accessToken: null,
          userId: null
        });
        expect(state).to.eql(expectedState);
      });

      it('must return LOGGED OUT initial state when an expired access token is given', () => {
        // the token
        const exp = 1491903618 * 1000;
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0OTE5MDM2MTh9.3iH9ZXaaACF0Jugajfv4TggeUcqJzPQYqGveh16WHkU';

        const reducer = reducerFactory(expiredToken, exp + 1000); // +1 second
        const state = reducer(undefined, {});
        const expectedState = fromJS({
          status: {},
          jwt: null,
          accessToken: null,
          userId: null
        });
        expect(state).to.eql(expectedState);
      });

      it('must return LOGGED IN initial state when a valid access token is given', () => {
        const exp = 1491903618 * 1000;
        const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0OTE5MDM2MTgsInN1YiI6MTIzfQ._Er1LBGLVnD3bdg439fgL7E1YcnMgTDYtzfgjQrQrXQ';
        const reducer = reducerFactory(validToken, exp - 1000); // -1 second
        const state = reducer(undefined, {});
        const expectedState = fromJS({
          status: {},
          jwt: validToken,
          accessToken: decodeJwt(validToken),
          userId: 123
        });
        expect(state).to.eql(expectedState);
      });
    });
  });

  describe('(Selectors)', () => {
    it('must detect that the user is not logged in', () => {
      const state = {
        auth: fromJS({
          userId: null
        })
      };

      expect(isLoggedIn(state)).to.equal(false);
    });

    it('must detect that the user is logged in', () => {
      const state = {
        auth: fromJS({
          userId: 123
        })
      };

      expect(isLoggedIn(state)).to.equal(true);
    });

    it('must select correct OK status', () => {
      const state = {
        auth: fromJS({
          status: { abc: statusTypes.LOGGED_IN }
        })
      };

      expect(statusSelector('abc')(state)).to.equal(statusTypes.LOGGED_IN);
      expect(hasSucceeded('abc')(state)).to.equal(true);
      expect(hasFailed('abc')(state)).to.equal(false);
    });

    it('must select correct FAIL status', () => {
      const state = {
        auth: fromJS({
          status: { abc: statusTypes.LOGIN_FAILED }
        })
      };

      expect(statusSelector('abc')(state)).to.equal(statusTypes.LOGIN_FAILED);
      expect(hasSucceeded('abc')(state)).to.equal(false);
      expect(hasFailed('abc')(state)).to.equal(true);
    });
  });

  describe('(Middleware)', () => {});
});
