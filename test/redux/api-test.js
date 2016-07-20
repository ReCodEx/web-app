import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const expect = chai.expect;

import fetchMock from 'fetch-mock';
import { apiCall, getExtraHeaders, API_BASE } from '../../src/redux/api';

describe('API helper function', () => {
  it('must not add Authorization header unless the access token is in the store', () => {
    const state = {
      auth: {}
    };

    expect(getExtraHeaders(state)).to.eql({});
  });

  it('must add Authorization header if the access token is in the store', () => {
    const state = {
      auth: {
        accessToken: 'XYZ'
      }
    };

    expect(getExtraHeaders(state)).to.eql({
      'Authorization': 'Bearer XYZ'
    });
  });

  it('must create a thunk for an action which expects 2 params', () => {
    const thunk = apiCall({});
    expect(thunk).to.be.a('function');
    expect(thunk.length).to.equal(2);
  });

  it('must dispatch an action for redux-promise-middleware', () => {
    fetchMock.mock(`${API_BASE}/ratata`, 200);


    const args = {
      type: 'TEST_REQ',
      method: 'PUT',
      endpoint: '/ratata'
    };
    const thunk = apiCall(args);

    const spy = chai.spy();
    const dispatch = (action) => {
      spy(action);
      return action;
    };
    const getState = () => ({ auth: {} });

    const action = thunk(dispatch, getState);
    expect(action.type).to.equal(args.type);
    expect(action.payload).to.be.an('object');
    expect(action.payload.promise.then).to.be.a('function');
    expect(spy).to.have.been.called.once();
    expect(spy).to.have.been.called.with(action);
    expect()
  });
});
