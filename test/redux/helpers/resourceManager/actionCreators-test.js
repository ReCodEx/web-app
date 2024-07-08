import { fromJS } from 'immutable';
import actionTypesFactory from '../../../../src/redux/helpers/resourceManager/actionTypesFactory.js';
import actionCreatorsFactory from '../../../../src/redux/helpers/resourceManager/actionCreatorsFactory.js';

import chai from '../../../chai-spy.js';

// prepared spies
let globalNeedsRefetching = false; // this is really disgusting, I know...
const needsRefetchingOriginal = () => globalNeedsRefetching;
let needsRefetching = null;
let createAction = null;
let createApiAction = null;

const actionTypes = actionTypesFactory('abc', 'xyz');
let actionCreators = null;

describe('Resource manager', () => {
  describe('(Action creators)', () => {
    beforeEach(function () {
      needsRefetching = chai.spy(needsRefetchingOriginal);
      createAction = chai.spy();
      createApiAction = chai.spy();
      actionCreators = actionCreatorsFactory({
        actionTypes,
        selector: state => state,
        apiEndpointFactory: (id = '') => `url/${id}`,
        needsRefetching,
        createAction,
        createApiAction,
      });
    });

    describe('FETCH', () => {
      it('must create simple fetch action creator', () => {
        const { fetchResource } = actionCreators;

        // fetchResource must be a function with one parameter
        chai.expect(fetchResource).to.be.a('function');
        chai.expect(fetchResource.length).to.equal(1);

        // calling fetchResource will create an action through the 'createApiAction' function
        fetchResource('abc');
        chai.expect(createApiAction).to.have.been.called.once;
        chai.expect(createApiAction).to.have.been.called.with({
          type: actionTypes.FETCH,
          method: 'GET',
          endpoint: 'url/abc',
          meta: { id: 'abc' },
        });
      });

      it('must create fetch action which checks if the resource is not already cached', done => {
        const { fetchOneIfNeeded } = actionCreators;

        // fetchResource must be a function with one parameter
        chai.expect(fetchOneIfNeeded).to.be.a('function');
        chai.expect(fetchOneIfNeeded.length).to.equal(1);

        // calling fetchResource will create a thunk
        const thunk = fetchOneIfNeeded('abc');
        chai.expect(thunk).to.be.a('function');
        chai.expect(thunk.length).to.equal(2);

        const getState = () =>
          fromJS({
            resources: {
              abc: { status: 'FULFILLED', data: { a: 'b' } },
            },
          });

        globalNeedsRefetching = false;
        const dispatch = chai.spy();
        const thunkResult = thunk(dispatch, getState);

        chai.expect(dispatch).to.not.have.been.called();
        chai.expect(thunkResult.then).to.be.a('function');
        thunkResult.then(() => done()); // must be resolved right away
      });

      it('must create fetch action which checks if the resource is not already cached and if it is not, then dispatch fetchResource action', () => {
        const { fetchOneIfNeeded, fetchResource } = actionCreators;
        const thunk = fetchOneIfNeeded('abc');

        const getState = () =>
          fromJS({
            resources: {
              abc: { status: '', data: { a: 'b' } },
            },
          });

        globalNeedsRefetching = true;
        const dispatch = chai.spy();
        thunk(dispatch, getState); // we don't care about the resulting state in this test

        chai.expect(dispatch).to.have.been.called.once;
        chai.expect(dispatch).to.have.been.called.with(fetchResource('abc'));
      });
    });

    describe('FETCH MANY', () => {
      it('must create "fetch many" action creator', () => {
        const { fetchMany } = actionCreators;

        // fetchResource must be a function with one parameter
        chai.expect(fetchMany).to.be.a('function');
        chai.expect(fetchMany.length).to.equal(1);

        // calling fetchResource will create an action through the 'createApiAction' function
        fetchMany({});
        chai.expect(createApiAction).to.have.been.called.once;
        chai.expect(createApiAction).to.have.been.called.with({
          type: actionTypes.FETCH_MANY,
          method: 'GET',
          endpoint: 'url/',
        });
      });
    });

    describe('ADD RESOURCE', () => {
      it('must create an "add resource" action creator', () => {
        const { addResource } = actionCreators;

        chai.expect(addResource).to.be.a('function');
        chai.expect(addResource.length).to.equal(1);

        const body = { foo: 'bar', abc: 'xyz' };
        const tmpId = 'random-tmp-id';
        addResource(body, tmpId);
        chai.expect(createApiAction).to.have.been.called.once;
        chai.expect(createApiAction).to.have.been.called.with({
          type: actionTypes.ADD,
          method: 'POST',
          endpoint: 'url/',
          body,
          meta: { tmpId, body },
        });
      });

      it('must generate random temporary ID', () => {
        const { addResource } = actionCreators;
        addResource({ foo: 'bar' });
      });
    });

    describe('UPDATE RESOURCE', () => {
      it('must create an "update resource" action creator', () => {
        const { updateResource } = actionCreators;

        chai.expect(updateResource).to.be.a('function');
        chai.expect(updateResource.length).to.equal(2);

        const body = { foo: 'bar', abc: 'xyz' };
        const id = 'some-id';
        updateResource(id, body);
        chai.expect(createApiAction).to.have.been.called.once;
        chai.expect(createApiAction).to.have.been.called.with({
          type: actionTypes.UPDATE,
          method: 'POST',
          endpoint: `url/${id}`,
          body,
          meta: { id, body },
        });
      });
    });

    describe('REMOVE RESOURCE', () => {
      it('must create an "remove resource" action creator', () => {
        const { removeResource } = actionCreators;

        chai.expect(removeResource).to.be.a('function');
        chai.expect(removeResource.length).to.equal(1);

        const id = 'some-id';
        removeResource(id);
        chai.expect(createApiAction).to.have.been.called.once;
        chai.expect(createApiAction).to.have.been.called.with({
          type: actionTypes.REMOVE,
          method: 'DELETE',
          endpoint: `url/${id}`,
          meta: { id },
        });
      });
    });
  });
});
