import { expect } from 'chai';

import {
  getHeaders,
  assembleEndpoint
} from '../../../../src/redux/helpers/api/tools';

describe('API middleware and helper functions', () => {
  describe('(Helper functions)', () => {
    it('must add access token to the headers', () => {
      expect(getHeaders({ a: 'b' }, 'abcd')).to.eql({
        a: 'b',
        Authorization: 'Bearer abcd',
        'Content-Type': 'application/json'
      });
    });

    it('must create proper URL from the params', () => {
      expect(
        assembleEndpoint('http://www.blabla.com/abcd?x=y', { a: 'b', c: 'd' })
      ).to.equal('http://www.blabla.com/abcd?x=y&a=b&c=d');
      expect(
        assembleEndpoint('http://www.blabla.com/abcd', {
          x: 'y',
          a: 'b',
          c: 'd'
        })
      ).to.equal('http://www.blabla.com/abcd?x=y&a=b&c=d');
      expect(assembleEndpoint('http://www.blabla.com/abcd', {})).to.equal(
        'http://www.blabla.com/abcd'
      );
      expect(assembleEndpoint('http://www.blabla.com/abcd')).to.equal(
        'http://www.blabla.com/abcd'
      );
    });
  });
});
