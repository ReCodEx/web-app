import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const expect = chai.expect;

import fetchMock from 'fetch-mock';
import { actionTypesFactory } from '../../../src/redux/helpers/resourceManager';

describe('Resource manager', () => {
  describe('(Action creators)', () => {
    it('must create actions according to the given resource name', () => {
      const resourceName = 'blabla';
      expect(actionTypesFactory(resourceName)).to.eql({
        FETCH: `recodex/resource/${resourceName}/FETCH`,
        FETCH_PENDING: `recodex/resource/${resourceName}/FETCH_PENDING`,
        FETCH_FULFILLED: `recodex/resource/${resourceName}/FETCH_FULFILLED`,
        FETCH_FAILED: `recodex/resource/${resourceName}/FETCH_REJECTED`,
        INVALIDATE: `recodex/resource/${resourceName}/INVALIDATE`
      });
    });

    // @todo test the action creators
  });

  describe('(Reducer)', () => {

  });
});
