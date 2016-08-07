import { createAction, handleActions } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware';
import { login } from './auth';

import { push } from 'react-router-redux';

export const actionTypes = {
  CREATE_ACCOUNT: 'recodex/registration/CREATE_ACCOUNT',
  CREATE_ACCOUNT_PENDING: 'recodex/registration/CREATE_ACCOUNT_PENDING',
  CREATE_ACCOUNT_FULFILLED: 'recodex/registration/CREATE_ACCOUNT_FULFILLED',
  CREATE_ACCOUNT_REJECTED: 'recodex/registration/CREATE_ACCOUNT_REJECTED'
};

export const statusTypes = {
  IDLE: 'IDLE',
  CREATING_ACCOUNT: 'CREATING_ACCOUNT',
  ACCOUNT_CREATING_FAILED: 'ACCOUNT_CREATING_FAILED',
  ACCOUNT_CREATED: 'ACCOUNT_CREATED'
};

const getUserId = (token) => token.sub.id;

/**
 * Actions
 */

export const createAccount = (firstName, lastName, email, password) =>
  createApiAction({
    type: actionTypes.CREATE_ACCOUNT,
    method: 'POST',
    endpoint: '/users/create-account',
    body: { firstName, lastName, email, password }
  });

const initialState = {
  status: statusTypes.IDLE
};

const reducer = handleActions({

  [actionTypes.CREATING_ACCOUNT_PENDING]: (state, action) => ({
    status: statusTypes.CREATING_ACCOUNT
  }),

  [actionTypes.CREATE_ACCOUNT_FULFILLED]: (state, action) => ({
    status: statusTypes.ACCOUNT_CREATED
  }),

  [actionTypes.CREATE_ACCOUNT_REJECTED]: (state, action) => ({
    status: statusTypes.ACCOUNT_CREATING_FAILED
  })

}, initialState);

export default reducer;
