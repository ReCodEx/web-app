import chai from 'chai';
import spies from 'chai-spies';
import { fromJS } from 'immutable';

import reducerFactory, {
  actionTypes,
  statusTypes,
  logout,
  login,
  externalLogin,
  LOCAL_LOGIN,
} from '../../../src/redux/modules/auth';
import { isLoggedIn, hasSucceeded, hasFailed, statusSelector } from '../../../src/redux/selectors/auth';

import decodeJwt from 'jwt-decode';

chai.use(spies);
const expect = chai.expect;

describe('Authentication', () => {
  describe('(Action creators)', () => {
    it('must create a valid logout action', () => {
      const action = logout();
      expect(action).to.eql({ type: actionTypes.LOGOUT });
    });

    it('must create correct login request action', () => {
      const action = login('usr', 'pwd');
      expect(action.request).to.eql({
        type: actionTypes.LOGIN,
        method: 'POST',
        endpoint: '/login',
        body: { username: 'usr', password: 'pwd' },
        meta: { service: LOCAL_LOGIN },
      });
    });

    it('must create correct external login request action', () => {
      const serviceId = 'some-ext-service';
      const token = 'kzr-pzr';
      const action = externalLogin(serviceId, token);
      expect(action.request).to.eql({
        type: actionTypes.LOGIN,
        method: 'POST',
        endpoint: `/login/${serviceId}`,
        body: {
          token,
        },
        meta: { service: serviceId, popupWindow: null },
      });
    });
  });

  describe('(Reducer)', () => {
    describe('Initial state', () => {
      it('must return LOGGED OUT initial state with no access token given', () => {
        const reducer = reducerFactory(null, null); // no access token
        const state = reducer(undefined, {});
        const expectedState = fromJS({
          status: {},
          jwt: null,
          accessToken: null,
          userId: null,
          instanceId: null,
        });
        expect(state).to.eql(expectedState);
      });

      it('must return LOGGED OUT initial state when an invalid access token is given', () => {
        const reducer = reducerFactory('abcde', null); // invalid access token
        const state = reducer(undefined, {});
        const expectedState = fromJS({
          status: {},
          jwt: null,
          accessToken: null,
          userId: null,
          instanceId: null,
        });
        expect(state).to.eql(expectedState);
      });

      it('must return LOGGED OUT initial state when an expired access token is given', () => {
        // the token
        const exp = 1491903618 * 1000;
        const expiredToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0OTE5MDM2MTh9.3iH9ZXaaACF0Jugajfv4TggeUcqJzPQYqGveh16WHkU';

        const reducer = reducerFactory(expiredToken, null, exp + 1000); // +1 second
        const state = reducer(undefined, {});
        const expectedState = fromJS({
          status: {},
          jwt: null,
          accessToken: null,
          userId: null,
          instanceId: null,
        });
        expect(state).to.eql(expectedState);
      });

      it('must return LOGGED IN initial state when a valid access token is given', () => {
        const exp = 1491903618 * 1000;
        const validToken =
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0OTE5MDM2MTgsInN1YiI6MTIzfQ._Er1LBGLVnD3bdg439fgL7E1YcnMgTDYtzfgjQrQrXQ';
        const reducer = reducerFactory(validToken, 'instance-id', exp - 1000); // -1 second
        const state = reducer(undefined, {});
        const expectedState = fromJS({
          status: {},
          jwt: validToken,
          accessToken: decodeJwt(validToken),
          userId: 123,
          instanceId: 'instance-id',
        });
        expect(state).to.eql(expectedState);
      });
    });
  });

  describe('(Selectors)', () => {
    it('must detect that the user is not logged in', () => {
      const state = {
        auth: fromJS({
          userId: null,
        }),
      };

      expect(isLoggedIn(state)).to.equal(false);
    });

    it('must detect that the user is logged in', () => {
      const state = {
        auth: fromJS({
          userId: 123,
          accessToken: {
            exp: Date.now() / 1000 + 100,
          },
        }),
      };

      expect(isLoggedIn(state)).to.equal(true);
    });

    it('must select correct OK status', () => {
      const state = {
        auth: fromJS({
          status: { abc: statusTypes.LOGGED_IN },
        }),
      };

      expect(statusSelector('abc')(state)).to.equal(statusTypes.LOGGED_IN);
      expect(hasSucceeded('abc')(state)).to.equal(true);
      expect(hasFailed('abc')(state)).to.equal(false);
    });

    it('must select correct FAIL status', () => {
      const state = {
        auth: fromJS({
          status: { abc: statusTypes.LOGIN_FAILED },
        }),
      };

      expect(statusSelector('abc')(state)).to.equal(statusTypes.LOGIN_FAILED);
      expect(hasSucceeded('abc')(state)).to.equal(false);
      expect(hasFailed('abc')(state)).to.equal(true);
    });
  });

  describe('(Middleware)', () => {});
});
