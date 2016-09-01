import { expect } from 'chai';
import { fromJS } from 'immutable';

import {
  resourceStatus,
  isLoading,
  hasFailed,
  isReady,
  didInvalidate,
  afterTenMinutesIsTooOld,
  isTooOld
} from '../../../../src/redux/helpers/resourceManager/status';
import createRecord from '../../../../src/redux/helpers/resourceManager/recordFactory';

describe('Resource manager', () => {
  describe('(Status)', () => {
    it('must recognize that the resource is loading by default', () => {
      const record = createRecord();
      expect(isLoading(record)).to.equal(true);
      expect(hasFailed(record)).to.equal(false);
      expect(isReady(record)).to.equal(false);
    });

    it('must recognize that the resource is loading', () => {
      const record = createRecord({ state: resourceStatus.PENDING });
      expect(isLoading(record)).to.equal(true);
      expect(hasFailed(record)).to.equal(false);
      expect(isReady(record)).to.equal(false);
    });

    it('must recognize that the resource loading has failed', () => {
      const record = createRecord({ state: resourceStatus.FAILED });
      expect(hasFailed(record)).to.equal(true);
      expect(isLoading(record)).to.equal(false);
      expect(isReady(record)).to.equal(false);
    });

    it('must recognize that the resource is loaded', () => {
      const record = createRecord({ state: resourceStatus.FULFILLED, data: { a: 'b' } });
      expect(isReady(record)).to.equal(true);
      expect(hasFailed(record)).to.equal(false);
      expect(isLoading(record)).to.equal(false);
    });

    it('must determine if the record is too old or not', () => {
      const hundredMsIsTooOld = isTooOld(100);
      expect(hundredMsIsTooOld(createRecord({ lastUpdate: Date.now() - 101 }))).to.equal(true);
      expect(hundredMsIsTooOld(createRecord({ lastUpdate: Date.now() }))).to.equal(false);
    });

    describe('default function to see if record is more than 10 minutes old', () => {
      it('must notice that a record is too old', () => {
        const oldRecord = createRecord({ lastUpdate: Date.now() - (10 * 60 * 1000 + 5) }); // 10:00:005
        expect(afterTenMinutesIsTooOld(oldRecord)).to.equal(true);
      });

      it('must leave a recent-enough record alone', () => {
        const okRecord = createRecord({ lastUpdate: Date.now() - (9 * 60 * 1000 + 59 * 1000 + 998) }); // 9:59:998
        expect(afterTenMinutesIsTooOld(okRecord)).to.equal(false);
      });
    });

    it('must recognize that a record is invalid when it is manually set to be invalid', () => {
      const invalidRecord = createRecord({ didInvalidate: true });
      const validRecord = createRecord({ didInvalidate: false });
      expect(didInvalidate(invalidRecord)).to.equal(true);
      expect(didInvalidate(validRecord)).to.equal(false);
    });
  });
});
