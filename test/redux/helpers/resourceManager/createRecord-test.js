import chai from 'chai';
import chaiImmutable from 'chai-immutable';
chai.use(chaiImmutable);
const expect = chai.expect;

import { fromJS } from 'immutable';
import createRecord from '../../../../src/redux/helpers/resourceManager/recordFactory';
import { resourceStatus } from '../../../../src/redux/helpers/resourceManager/status';

describe('Resource manager', () => {
  describe('(Record factory)', () => {
    it('must create a default record with all correct default values', () => {
      const record = createRecord();
      expect(record).to.be.an('object');
      expect(record).to.have.size(4); // 4 fields - not more, not less
      expect(record.get('state')).to.equal(resourceStatus.PENDING);
      expect(record.get('data')).to.equal(null);
      expect(record.get('didInvalidate')).to.equal(false);
      expect(record.get('lastUpdate')).to.be.a('number');
      expect(Date.now() - record.get('lastUpdate')).to.be.at.most(10); // 10ms tolerance
    });

    it('must create a record with specific fields', () => {
      const cfg = {
        state: 'WHATEVER!!',
        didInvalidate: true,
        lastUpdate: Date.now() + 1000000,
        data: 'not null'
      };
      const record = createRecord(cfg);
      expect(record.get('state')).to.equal(cfg.state);
      expect(record.get('didInvalidate')).to.equal(cfg.didInvalidate);
      expect(record.get('lastUpdate')).to.equal(cfg.lastUpdate);
      expect(record.get('data')).to.equal(cfg.data);
    });

    it('must ignore any additional fields passed to the factory', () => {
      const record = createRecord({ foo: 'bar' });
      expect(record.get('foo')).to.equal(undefined);
    });

    it('must create a record with specific data and make data deeply an immutable structure', () => {
      const data = {
        name: 'DATA',
        items: [ 'a', 'b', 'c' ],
        nested: {
          child: 'CHILD',
          list: [ 'x', 'y', { 'p': 'q' } ]
        }
      };
      const record = createRecord({ data });
      expect(record.get('data')).to.be.an('object');
      expect(record.get('data')).to.have.size(3);
      expect(record.getIn(['data', 'name'])).to.equal('DATA');
      expect(record.getIn(['data', 'items'])).to.have.size(3);
      expect(record.getIn(['data', 'items']).first()).to.equal('a');
      expect(record.getIn(['data', 'items']).get(1)).to.equal('b');
      expect(record.getIn(['data', 'items']).last()).to.equal('c');
      expect(record.getIn(['data', 'nested'])).to.have.size(2);
      expect(record.getIn(['data', 'nested', 'child'])).to.equal('CHILD');
      expect(record.getIn(['data', 'nested', 'list'])).to.have.size(3);
      expect(record.getIn(['data', 'nested', 'list', 0])).to.equal('x');
      expect(record.getIn(['data', 'nested', 'list', 1])).to.equal('y');
      expect(record.getIn(['data', 'nested', 'list', 2, 'p'])).to.equal('q');
    });
  });
});
