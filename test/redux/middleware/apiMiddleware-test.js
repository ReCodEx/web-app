import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const expect = chai.expect;

import fetchMock from 'fetch-mock';
import middleware, {
  CALL_API,
  createApiAction
} from '../../../src/redux/middleware/apiMiddleware';
import { API_BASE } from '../../../src/redux/helpers/api/tools';

describe('API middleware and helper functions', () => {
  it('must create correct api call action', () => {
    const action = createApiAction({ type: 'TYPE', payload: 'payload' });
    expect(action).to.eql({
      type: CALL_API,
      request: {
        type: 'TYPE',
        payload: 'payload'
      }
    });
  });

  describe('(Middleware)', () => {
    it('must throw an error when an API call action without request info is dispatched', () => {
      const action = { type: CALL_API, randomData: 'blabla' };
      expect(() => middleware(null)(null)(action)).to.throw();
    });

    it('must intersect API call actions and create request', done => {
      const requestInfo = { type: 'A', endpoint: '/abc' };
      let action = createApiAction(requestInfo);
      const spy = chai.spy();
      const next = action => {
        spy();
        return action;
      };

      // setup fetchMock
      fetchMock.restore();
      const endpoint = `${API_BASE}/abc`;
      fetchMock.mock(endpoint, { success: true });

      const dispatchSpy = chai.spy();
      const dispatch = action => {
        dispatchSpy();
        return action;
      };

      const alteredAction = middleware({ dispatch })(next)(action);
      alteredAction.payload.promise.then(resp => {
        // no errors, no dispatch call
        expect(dispatchSpy).to.not.have.been.called();

        // examine the HTTP request
        expect(fetchMock.calls().matched.length).to.equal(1);
        expect(fetchMock.calls().unmatched.length).to.equal(0);
        const [url, req] = fetchMock.calls().matched.pop();
        expect(url).to.equal(endpoint);
        expect(req.method.toLowerCase()).to.equal('get');
        fetchMock.restore();

        // examine the NEXT call
        expect(spy).to.have.been.called();
        expect(spy).to.have.been.called.once();

        fetchMock.restore();
        done();
      });
    });
  });
});
