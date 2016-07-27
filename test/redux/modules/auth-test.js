import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const expect = chai.expect;

import fetchMock from 'fetch-mock';
import reducer, { actionTypes, statusTypes, logout, login } from '../../../src/redux/modules/auth';

describe.skip('Authentication', () => {

  describe('(Action creators)', () => {

    it('must create a valid logout action and remove the stored access token', () => {
    });

    it('must create correct login request action', (done) => {
    });

  });

});
