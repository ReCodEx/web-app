import chai from 'chai';
import spies from 'chai-spies';

chai.use(spies);
const expect = chai.expect;

import fetchMock from 'fetch-mock';
import { API_BASE } from '../../../src/redux/api';
import reducer, { actionTypes, statusTypes, logout, login } from '../../../src/redux/modules/auth';

describe('Authentication', () => {

  describe('(Action creators)', () => {

    it.skip('must create a valid logout action and remove the stored access token', () => {
      const thunk = logout();

      expect(thunk).to.be.a('function');
      expect(thunk.length).to.equal(2);
    });

    it.skip('must create correct login request action', (done) => {
      const email = 'X@Y.Z';
      const password = 'ZZZZZZZZZZ';
      const thunk = login(email, password);

      expect(thunk).to.be.a('function');
      expect(thunk.length).to.equal(2);

      // ----------------\
      // @todo update when the final API is ready
      const resp = {
        "accessToken": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvcmVjb2RleC5wcm9qZWt0eS5tcy5tZmYuY3VuaS5jeiIsImF1ZCI6Imh0dHBzOlwvXC9yZWNvZGV4LnByb2pla3R5Lm1zLm1mZi5jdW5pLmN6IiwiaWF0IjoxNDY5NDU4Mjk4LCJuYmYiOjE0Njk0NTgyOTgsImV4cCI6MTQ2OTU0NDY5OCwic3ViIjp7ImlkIjoiMWZlMjI1NWUtNTBlMi0xMWU2LWJlYjgtOWU3MTEyOGNhZTc3IiwiZnVsbE5hbWUiOiJCYy4gXHUwMTYwaW1vbiBSb3pzXHUwMGVkdmFsIiwibmFtZSI6eyJkZWdyZWVzQmVmb3JlTmFtZSI6IkJjLiIsImZpcnN0TmFtZSI6Ilx1MDE2MGltb24iLCJsYXN0TmFtZSI6IlJvenNcdTAwZWR2YWwiLCJkZWdyZWVzQWZ0ZXJOYW1lIjoiIn0sImVtYWlsIjoic2ltb24ucm96c2l2YWxAZ21haWwuY29tIiwiaXNWZXJpZmllZCI6dHJ1ZSwicm9sZSI6InN1cGVyYWRtaW4ifX0.KmuQ32kh3ohZVzXaLceQlEc-b1XR8702R9xNP6GWNlQ",
        "user": {
          "id": "1fe2255e-50e2-11e6-beb8-9e71128cae77",
          "fullName": "Bc. Šimon Rozsíval",
          "name": {
            "degreesBeforeName": "Bc.",
            "firstName": "Šimon",
            "lastName": "Rozsíval",
            "degreesAfterName": ""
          },
          "email": "simon.rozsival@gmail.com",
          "isVerified": true,
          "role": "superadmin"
        }
      };
      fetchMock.mock(`${API_BASE}/login?username=${email}&password=${password}`, 'GET', resp);
      // ----------------/

      const dispatch = (action) => action;
      const getState = () => ({ auth: {} });
      const action = thunk(dispatch, getState);

      // @todo: Update this test - it does not reflect the state of the app at the moment

      // expect(action.type).to.equal(actionTypes.LOGIN);
      // expect(action.payload).to.be.an('object');
      // expect(Object.keys(action).length).to.equal(2);
      // expect(action.payload.promise.then).to.be.a('function');

      // action.payload.promise
      //   .then(json => {
      //     expect(json).to.eql(resp);
      //     done();
      //   })
      //   .catch(err => done(err));
    });

  });

});
