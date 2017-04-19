import { expect } from 'chai';

import {
  getHeaders,
  assembleEndpoint,
  flattenBody
} from '../../../../src/redux/helpers/api/tools';

describe('API middleware and helper functions', () => {
  describe('(Helper functions)', () => {
    it('must add access token to the headers', () => {
      expect(getHeaders({ a: 'b' }, 'abcd')).to.eql({
        a: 'b',
        Authorization: 'Bearer abcd'
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

    it('must flatten the body object to urlencoded format', () => {
      expect(flattenBody({})).to.eql({});
      expect(flattenBody([])).to.eql({});
      expect(flattenBody({ a: 'b' })).to.eql({ a: 'b' });
      expect(flattenBody({ a: { b: 'c' } })).to.eql({ 'a[b]': 'c' });
      expect(flattenBody({ a: { b: { c: 'd' } } })).to.eql({ 'a[b][c]': 'd' });
      expect(flattenBody({ a: { b: ['c', 'd'] } })).to.eql({
        'a[b][0]': 'c',
        'a[b][1]': 'd'
      });
      expect(
        flattenBody({
          a: [
            {
              b: [{ c: 'A' }, { d: 'B' }]
            },
            [{ f: 'C', g: 'D' }, { h: 'E' }]
          ]
        })
      ).to.eql({
        'a[0][b][0][c]': 'A',
        'a[0][b][1][d]': 'B',
        'a[1][0][f]': 'C',
        'a[1][0][g]': 'D',
        'a[1][1][h]': 'E'
      });

      // not a POJO
      expect(() => flattenBody({ a: new MouseEvent('click') })).to.throw();
    });
  });
});
