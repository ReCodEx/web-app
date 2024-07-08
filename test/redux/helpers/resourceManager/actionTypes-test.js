import { expect } from 'chai';
import actionTypesFactory, { getActionTypes } from '../../../../src/redux/helpers/resourceManager/actionTypesFactory.js';

describe('Resource manager', () => {
  describe('(Action types)', () => {
    it('must combine prefixes, actions and postfixes', () => {
      const actionTypes = getActionTypes('xyz', ['A', 'B', 'C'], ['', '_P', '_Q']);
      expect(actionTypes).to.eql({
        'A': 'xyz/A',
        'A_P': 'xyz/A_P',
        'A_Q': 'xyz/A_Q',
        'B': 'xyz/B',
        'B_P': 'xyz/B_P',
        'B_Q': 'xyz/B_Q',
        'C': 'xyz/C',
        'C_P': 'xyz/C_P',
        'C_Q': 'xyz/C_Q'
      });
    });

    it('must create all defined actions according to the given resource name', () => {
      const resourceName = 'blabla';
      expect(actionTypesFactory(resourceName)).to.eql({
        FETCH: `recodex/resource/${resourceName}/FETCH`,
        FETCH_PENDING: `recodex/resource/${resourceName}/FETCH_PENDING`,
        FETCH_FULFILLED: `recodex/resource/${resourceName}/FETCH_FULFILLED`,
        FETCH_REJECTED: `recodex/resource/${resourceName}/FETCH_REJECTED`,
        ADD: `recodex/resource/${resourceName}/ADD`,
        ADD_PENDING: `recodex/resource/${resourceName}/ADD_PENDING`,
        ADD_FULFILLED: `recodex/resource/${resourceName}/ADD_FULFILLED`,
        ADD_REJECTED: `recodex/resource/${resourceName}/ADD_REJECTED`,
        UPDATE: `recodex/resource/${resourceName}/UPDATE`,
        UPDATE_PENDING: `recodex/resource/${resourceName}/UPDATE_PENDING`,
        UPDATE_FULFILLED: `recodex/resource/${resourceName}/UPDATE_FULFILLED`,
        UPDATE_REJECTED: `recodex/resource/${resourceName}/UPDATE_REJECTED`,
        REMOVE: `recodex/resource/${resourceName}/REMOVE`,
        REMOVE_PENDING: `recodex/resource/${resourceName}/REMOVE_PENDING`,
        REMOVE_FULFILLED: `recodex/resource/${resourceName}/REMOVE_FULFILLED`,
        REMOVE_REJECTED: `recodex/resource/${resourceName}/REMOVE_REJECTED`,
        FETCH_MANY: `recodex/resource/${resourceName}/FETCH_MANY`,
        FETCH_MANY_PENDING: `recodex/resource/${resourceName}/FETCH_MANY_PENDING`,
        FETCH_MANY_FULFILLED: `recodex/resource/${resourceName}/FETCH_MANY_FULFILLED`,
        FETCH_MANY_REJECTED: `recodex/resource/${resourceName}/FETCH_MANY_REJECTED`,
        INVALIDATE: `recodex/resource/${resourceName}/INVALIDATE`
      });
    });
  });
});
