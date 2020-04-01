import { expect } from 'chai';
import actionTypesFactory, { getActionTypes } from '../../../../src/redux/helpers/resourceManager/actionTypesFactory';

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
        FETCH: `recovid/resource/${resourceName}/FETCH`,
        FETCH_PENDING: `recovid/resource/${resourceName}/FETCH_PENDING`,
        FETCH_FULFILLED: `recovid/resource/${resourceName}/FETCH_FULFILLED`,
        FETCH_REJECTED: `recovid/resource/${resourceName}/FETCH_REJECTED`,
        ADD: `recovid/resource/${resourceName}/ADD`,
        ADD_PENDING: `recovid/resource/${resourceName}/ADD_PENDING`,
        ADD_FULFILLED: `recovid/resource/${resourceName}/ADD_FULFILLED`,
        ADD_REJECTED: `recovid/resource/${resourceName}/ADD_REJECTED`,
        UPDATE: `recovid/resource/${resourceName}/UPDATE`,
        UPDATE_PENDING: `recovid/resource/${resourceName}/UPDATE_PENDING`,
        UPDATE_FULFILLED: `recovid/resource/${resourceName}/UPDATE_FULFILLED`,
        UPDATE_REJECTED: `recovid/resource/${resourceName}/UPDATE_REJECTED`,
        REMOVE: `recovid/resource/${resourceName}/REMOVE`,
        REMOVE_PENDING: `recovid/resource/${resourceName}/REMOVE_PENDING`,
        REMOVE_FULFILLED: `recovid/resource/${resourceName}/REMOVE_FULFILLED`,
        REMOVE_REJECTED: `recovid/resource/${resourceName}/REMOVE_REJECTED`,
        FETCH_MANY: `recovid/resource/${resourceName}/FETCH_MANY`,
        FETCH_MANY_PENDING: `recovid/resource/${resourceName}/FETCH_MANY_PENDING`,
        FETCH_MANY_FULFILLED: `recovid/resource/${resourceName}/FETCH_MANY_FULFILLED`,
        FETCH_MANY_REJECTED: `recovid/resource/${resourceName}/FETCH_MANY_REJECTED`,
        INVALIDATE: `recovid/resource/${resourceName}/INVALIDATE`
      });
    });
  });
});
