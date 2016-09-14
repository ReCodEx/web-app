import chai from 'chai';
import chaiImmutable from 'chai-immutable';
chai.use(chaiImmutable);
const expect = chai.expect;

import { Map, fromJS } from 'immutable';
import reducer, { actionTypes, initialState, searchStatus, search } from '../../../src/redux/modules/search';
import { CALL_API } from '../../../src/redux/middleware/apiMiddleware';

describe('Searching stuff', () => {
  describe('(Action creators)', () => {
    it('must create search request', () => {
      const action = search('/end/point')('xyz', 'abc');
      expect(action).eql({
        type: CALL_API,
        request: {
          type: actionTypes.SEARCH,
          endpoint: '/end/point',
          meta: { id: 'xyz', query: 'abc' },
          query: { search: 'abc' }
        }
      });
    });
  });

  describe('(Reducer)', () => {
    it('must create immutable initial state', () => {
      expect(initialState).to.equal(Map());
    });

    it('must start searching the query', () => {
      const id = 'xyz';
      const query = 'abc';
      const action = { type: actionTypes.SEARCH_PENDING, meta: { id, query } };
      let state = reducer(initialState, action);

      expect(state).to.have.size(1);
      expect(state).to.have.a.property(id);
      expect(state.getIn([id, 'status'])).to.equal(searchStatus.PENDING);
      expect(state.getIn([id, 'results'])).to.have.size(0);
      expect(state.getIn([id, 'query'])).to.equal(query);
    });

    it('must not override another search query', () => {
      const action = { type: actionTypes.SEARCH_PENDING, meta: { id: 'xyz', query: 'abc' }, query: { search: 'abc' } };
      let state = fromJS({
        pqr: { status: searchStatus.FAILED }
      });

      state = reducer(state, action);
      expect(state.getIn(['pqr', 'status'])).to.equal(searchStatus.FAILED);
      expect(state.getIn(['xyz', 'status'])).to.equal(searchStatus.PENDING);
    });

    it('must not override existing search query', () => {
      const action = { type: actionTypes.SEARCH_PENDING, meta: { id: 'xyz', query: 'abcd' }, query: { search: 'abcd' } };
      let state = fromJS({
        xyz: { status: searchStatus.READY, results: [ 'p', 'q', 'r' ] }
      });

      state = reducer(state, action);
      expect(state.getIn(['xyz', 'status'])).to.equal(searchStatus.PENDING);
      expect(state.getIn(['xyz', 'results'])).to.have.size(3);
    });

    it('must mark search results as failed', () => {
      const action = { type: actionTypes.SEARCH_REJECTED, meta: { id: 'xyz' } };
      let state = fromJS({
        xyz: { status: searchStatus.PENDING }
      });
      expect(reducer(state, action).getIn(['xyz', 'status'])).to.equal(searchStatus.FAILED);
    });

    it('must mark search results as finished', () => {
      const action = { type: actionTypes.SEARCH_FULFILLED, payload: [ 'a', 'b', 'c' ], meta: { id: 'xyz' } };
      let state = fromJS({
        xyz: { status: searchStatus.PENDING }
      });
      state = reducer(state, action);
      expect(state.getIn(['xyz', 'status'])).to.equal(searchStatus.READY);
      expect(state.getIn(['xyz', 'results'])).to.have.size(3);
      expect(state.getIn(['xyz', 'results', 0])).to.equal('a');
      expect(state.getIn(['xyz', 'results', 1])).to.equal('b');
      expect(state.getIn(['xyz', 'results', 2])).to.equal('c');
    });
  });
});
