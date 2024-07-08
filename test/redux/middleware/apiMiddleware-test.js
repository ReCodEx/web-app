import fetchMock from 'fetch-mock';
import chai from '../../chai-spy.js';
import middleware, { CALL_API, createApiAction } from '../../../src/redux/middleware/apiMiddleware.js';
import { API_BASE } from '../../../src/helpers/config.js';

describe('API middleware and helper functions', () => {
  it('must create correct api call action', () => {
    const action = createApiAction({ type: 'TYPE', payload: 'payload' });
    chai.expect(action).to.eql({
      type: CALL_API,
      request: {
        type: 'TYPE',
        payload: 'payload',
      },
    });
  });

  describe('(Middleware)', () => {
    it('must throw an error when an API call action without request info is dispatched', () => {
      const action = { type: CALL_API, randomData: 'blabla' };
      chai.expect(() => middleware(null)(null)(action)).to.throw();
    });

    it('must intersect API call actions and create request', done => {
      const requestInfo = { type: 'A', endpoint: '/abc' };
      const action = createApiAction(requestInfo);
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
        try {
          // exactly one dispatch incrementing and one decrementing the number of pending api calls ...
          chai.expect(dispatchSpy).to.have.been.called.twice;

          // examine the HTTP request
          chai.expect(fetchMock.calls('matched').length).to.equal(1);
          chai.expect(fetchMock.calls('unmatched').length).to.equal(0);
          const [url, req] = fetchMock.calls('matched').pop();
          chai.expect(url).to.equal(endpoint);
          chai.expect(req.method.toLowerCase()).to.equal('get');
          fetchMock.restore();

          // examine the NEXT call
          chai.expect(spy).to.have.been.called();
          chai.expect(spy).to.have.been.called.once;

          fetchMock.restore();
          done();
        } catch (e) {
          console.log(e);
        }
      });
    });
  });
});
