import chai from 'chai';
import spies from 'chai-spies';
import { fromJS } from 'immutable';

chai.use(spies);
const expect = chai.expect;

import actionTypesFactory from '../../../../src/redux/helpers/resourceManager/actionTypesFactory';
import actionCreatorsFactory from '../../../../src/redux/helpers/resourceManager/actionCreatorsFactory';

// prepared spies
var globalNeedsRefetching = false; // this is really disgusting, I know...
const needsRefetching = chai.spy(() => globalNeedsRefetching);
const createAction = chai.spy();
const createApiAction = chai.spy();

const actionTypes = actionTypesFactory('abc', 'xyz');
const actionCreators = actionCreatorsFactory({
  actionTypes,
  selector: state => state,
  apiEndpointFactory: (id = '') => `url/${id}`,
  needsRefetching,
  createAction,
  createApiAction
});

describe('Resource manager', () => {
  describe('(Action creators)', () => {
    beforeEach(function() {
      needsRefetching.reset();
      createAction.reset();
      createApiAction.reset();
    });

    describe('FETCH', () => {
      it('must create simple fetch action creator', () => {
        const { fetchResource } = actionCreators;

        // fetchResource must be a function with one parameter
        expect(fetchResource).to.be.a('function');
        expect(fetchResource.length).to.equal(1);

        // calling fetchResource will create an action through the 'createApiAction' function
        fetchResource('abc');
        expect(createApiAction).to.have.been.called.once();
        expect(createApiAction).to.have.been.called.with({
          type: actionTypes.FETCH,
          method: 'GET',
          endpoint: 'url/abc',
          meta: { id: 'abc' }
        });
      });

      it('must create fetch action which checks if the resource is not already cached', (done) => {
        const { fetchOneIfNeeded } = actionCreators;

        // fetchResource must be a function with one parameter
        expect(fetchOneIfNeeded).to.be.a('function');
        expect(fetchOneIfNeeded.length).to.equal(1);

        // calling fetchResource will create a thunk
        const thunk = fetchOneIfNeeded('abc');
        expect(thunk).to.be.a('function');
        expect(thunk.length).to.equal(2);

        const getState = () => fromJS({
          resources: {
            abc: { status: 'FULFILLED', data: { a: 'b' } }
          }
        });

        globalNeedsRefetching = false;
        const dispatch = chai.spy();
        const thunkResult = thunk(dispatch, getState);

        expect(dispatch).to.not.have.been.called();
        expect(thunkResult.then).to.be.a('function');
        thunkResult.then(() => done()); // must be resolved right away
      });

      it('must create fetch action which checks if the resource is not already cached and if it is not, then dispatch fetchResource action', () => {
        const { fetchOneIfNeeded, fetchResource } = actionCreators;
        const thunk = fetchOneIfNeeded('abc');

        const getState = () => fromJS({
          resources: {
            abc: { status: '', data: { a: 'b' } }
          }
        });

        globalNeedsRefetching = true;
        const dispatch = chai.spy();
        thunk(dispatch, getState); // we don't care about the resulting state in this test

        expect(dispatch).to.have.been.called.once();
        expect(dispatch).to.have.been.called.with(fetchResource('abc'));
      });
    });

    describe('FETCH MANY', () => {
      it('must create "fetch many" action creator', () => {
        const { fetchMany } = actionCreators;

        // fetchResource must be a function with one parameter
        expect(fetchMany).to.be.a('function');
        expect(fetchMany.length).to.equal(1);

        // calling fetchResource will create an action through the 'createApiAction' function
        fetchMany({});
        expect(createApiAction).to.have.been.called.once();
        expect(createApiAction).to.have.been.called.with({
          type: actionTypes.FETCH_MANY,
          method: 'GET',
          endpoint: 'url/'
        });
      });
    });

    describe('ADD RESOURCE', () => {
      it('must create an "add resource" action creator', () => {
        const { addResource } = actionCreators;

        expect(addResource).to.be.a('function');
        expect(addResource.length).to.equal(1);

        const body = { 'foo': 'bar', 'abc': 'xyz' };
        const tmpId = 'random-tmp-id';
        addResource(body, tmpId);
        expect(createApiAction).to.have.been.called.once();
        expect(createApiAction).to.have.been.called.with({
          type: actionTypes.ADD,
          method: 'POST',
          endpoint: 'url/',
          body,
          meta: { tmpId, body }
        });
      });

      it('must generate random temporary ID', () => {
        const { addResource } = actionCreators;
        addResource({ foo: 'bar' });
        const tmpId = createApiAction.__spy.calls[0][0].meta.tmpId; // first argument of first call of the spy
        expect(tmpId).to.be.a('string');
        expect(tmpId.length).to.be.at.least(5); // 5 was chosen quite arbitrarily, but should be good-enough meassure for this purpose
      });
    });

    describe('UPDATE RESOURCE', () => {
      it('must create an "update resource" action creator', () => {
        const { updateResource } = actionCreators;

        expect(updateResource).to.be.a('function');
        expect(updateResource.length).to.equal(2);

        const body = { 'foo': 'bar', 'abc': 'xyz' };
        const id = 'some-id';
        updateResource(id, body);
        expect(createApiAction).to.have.been.called.once();
        expect(createApiAction).to.have.been.called.with({
          type: actionTypes.UPDATE,
          method: 'POST',
          endpoint: `url/${id}`,
          body,
          meta: { id, body }
        });
      });
    });

    describe('REMOVE RESOURCE', () => {
      it('must create an "remove resource" action creator', () => {
        const { removeResource } = actionCreators;

        expect(removeResource).to.be.a('function');
        expect(removeResource.length).to.equal(1);

        const id = 'some-id';
        removeResource(id);
        expect(createApiAction).to.have.been.called.once();
        expect(createApiAction).to.have.been.called.with({
          type: actionTypes.REMOVE,
          method: 'DELETE',
          endpoint: `url/${id}`,
          meta: { id }
        });
      });
    });
  });
});
