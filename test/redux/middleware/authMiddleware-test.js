import { fromJS } from 'immutable';
import chai from '../../chai-spy.js';
import { createApiAction } from '../../../src/redux/middleware/apiMiddleware.js';
import { actionTypes as authActionTypes } from '../../../src/redux/modules/auth.js';

import middleware, {
  TOKEN_LOCAL_STORAGE_KEY,
  storeToken,
  removeToken,
  getToken,
} from '../../../src/redux/middleware/authMiddleware.js';

describe('Middleware for access token storage and injecting to HTTP requests', () => {
  afterEach(() => {
    localStorage.clear();
    localStorage.itemInsertionCallback = null;
  });

  describe('(Local storage manipulation)', () => {
    it('must store the token in localStorage', () => {
      localStorage.removeItem(TOKEN_LOCAL_STORAGE_KEY);
      chai.expect(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)).to.equal(null);
      storeToken('abcd');
      chai.expect(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)).to.equal('abcd');
    });

    it('must fetch the token in localStorage', () => {
      localStorage.removeItem(TOKEN_LOCAL_STORAGE_KEY);
      chai.expect(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)).to.equal(null);
      localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, 'hchkrdtn');
      chai.expect(getToken()).to.equal('hchkrdtn');
    });

    it('must remove the token from localStorage', () => {
      localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, 'abcdefgh');
      chai.expect(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)).to.equal('abcdefgh');
      removeToken();
      chai.expect(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)).to.equal(null);
    });
  });

  describe('(Middleware)', () => {
    const createFakeStore = () => ({ dispatch: chai.spy() });

    it('must intersect LOGIN action and store the accessToken in the payload', () => {
      // clean the storage first
      localStorage.removeItem(TOKEN_LOCAL_STORAGE_KEY);
      chai.expect(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)).to.equal(null);

      const action = {
        type: authActionTypes.LOGIN_FULFILLED,
        payload: {
          accessToken: 'abcdefgh',
          user: {
            privateData: {
              instancesIds: ['instance-id'],
              settings: {
                defaultLanguage: 'xy',
              },
            },
          },
        },
      };

      const store = createFakeStore();
      middleware(store)(a => a)(action);
      chai.expect(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)).to.equal('abcdefgh');
      chai.expect(store.dispatch).to.have.been.called.once;
    });

    it('must intersect LOGOUT action and remove the accessToken from the local storage', () => {
      // clean the storage first
      localStorage.setItem(TOKEN_LOCAL_STORAGE_KEY, 'hchkrdtn');
      const action = {
        type: authActionTypes.LOGOUT,
      };

      const store = createFakeStore();
      middleware(store)(a => a)(action);
      chai.expect(localStorage.getItem(TOKEN_LOCAL_STORAGE_KEY)).to.equal(null);
    });

    it('must intersect the CALL_API action and add access token to the request (if any)', () => {
      const action = createApiAction({});
      const accessToken = 'abcdefgh';
      chai
        .expect(
          middleware({
            getState: () => ({
              auth: fromJS({
                jwt: accessToken,
              }),
            }),
          })(a => a)(action).request
        )
        .to.eql({ accessToken });
    });
  });
});
