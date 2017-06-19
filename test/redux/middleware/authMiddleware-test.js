import { fromJS } from 'immutable';
import { createApiAction } from '../../../src/redux/middleware/apiMiddleware';
import { actionTypes as authActionTypes } from '../../../src/redux/modules/auth';

import middleware, {
  LOCAL_STORAGE_KEY,
  storeToken,
  removeToken,
  getToken
} from '../../../src/redux/middleware/authMiddleware';

import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const expect = chai.expect;

describe('Middleware for access token storage and injecting to HTTP requests', () => {
  afterEach(() => {
    localStorage.clear();
    localStorage.itemInsertionCallback = null;
  });

  describe('(Local storage manipulation)', () => {
    it('must store the token in localStorage', () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal(null);
      storeToken('abcd');
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal('abcd');
    });

    it('must fetch the token in localStorage', () => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal(null);
      localStorage.setItem(LOCAL_STORAGE_KEY, 'hchkrdtn');
      expect(getToken()).to.equal('hchkrdtn');
    });

    it('must remove the token from localStorage', () => {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'abcdefgh');
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal('abcdefgh');
      removeToken();
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal(null);
    });
  });

  describe('(Middleware)', () => {
    const createFakeStore = () => ({ dispatch: chai.spy() });

    it('must intersect LOGIN action and store the accessToken in the payload', () => {
      // clean the storage first
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal(null);

      const action = {
        type: authActionTypes.LOGIN_SUCCESS,
        payload: {
          accessToken: 'abcdefgh',
          user: {
            settings: {
              defaultLanguage: 'xy'
            }
          }
        }
      };

      const store = createFakeStore();
      middleware(store)(a => a)(action);
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal('abcdefgh');
      expect(store.dispatch).to.have.been.called.once();
    });

    it('must intersect LOGOUT action and remove the accessToken from the local storage', () => {
      // clean the storage first
      localStorage.setItem(LOCAL_STORAGE_KEY, 'hchkrdtn');
      const action = {
        type: authActionTypes.LOGOUT
      };

      const store = createFakeStore();
      middleware(store)(a => a)(action);
      expect(localStorage.getItem(LOCAL_STORAGE_KEY)).to.equal(null);
    });

    it('must intersect the CALL_API action and add access token to the request (if any)', () => {
      const action = createApiAction({});
      const accessToken = 'abcdefgh';
      expect(
        middleware({
          getState: () => ({
            auth: fromJS({
              jwt: accessToken
            })
          })
        })(a => a)(action).request
      ).to.eql({ accessToken });
    });
  });
});
