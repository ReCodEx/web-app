import { handleActions } from 'redux-actions';
import { createApiAction } from '../middleware/apiMiddleware.js';
import { fromJS } from 'immutable';

export const actionTypes = {
  RESEND_EMAIL: 'recodex/email-verification/RESEND_EMAIL',
  RESEND_EMAIL_PENDING: 'recodex/email-verification/RESEND_EMAIL_PENDING',
  RESEND_EMAIL_FULFILLED: 'recodex/email-verification/RESEND_EMAIL_FULFILLED',
  RESEND_EMAIL_REJECTED: 'recodex/email-verification/RESEND_EMAIL_REJECTED',
  EMAIL_VERIFICATION: 'recodex/email-verification/EMAIL_VERIFICATION',
  EMAIL_VERIFICATION_PENDING: 'recodex/email-verification/EMAIL_VERIFICATION_PENDING',
  EMAIL_VERIFICATION_FULFILLED: 'recodex/email-verification/EMAIL_VERIFICATION_FULFILLED',
  EMAIL_VERIFICATION_REJECTED: 'recodex/email-verification/EMAIL_VERIFICATION_REJECTED',
};

export const resendVerificationEmail = userId =>
  createApiAction({
    type: actionTypes.RESEND_EMAIL,
    method: 'POST',
    endpoint: '/email-verification/resend',
    meta: { userId },
  });

export const verifyEmail = (userId, accessToken) =>
  createApiAction({
    type: actionTypes.EMAIL_VERIFICATION,
    method: 'POST',
    endpoint: '/email-verification/verify',
    accessToken,
    meta: { userId },
  });

export const initialState = fromJS({});

const reducer = handleActions(
  {
    [actionTypes.EMAIL_VERIFICATION_PENDING]: (state, { meta: { userId } }) =>
      state.setIn([userId, 'verification'], 'PENDING'),

    [actionTypes.EMAIL_VERIFICATION_REJECTED]: (state, { meta: { userId } }) =>
      state.setIn([userId, 'verification'], 'FAILED'),

    [actionTypes.EMAIL_VERIFICATION_FULFILLED]: (state, { meta: { userId } }) =>
      state.setIn([userId, 'verification'], 'FULFILLED'),

    [actionTypes.RESEND_EMAIL_PENDING]: (state, { meta: { userId } }) => state.setIn([userId, 'resending'], 'PENDING'),

    [actionTypes.RESEND_EMAIL_REJECTED]: (state, { meta: { userId } }) => state.setIn([userId, 'resending'], 'FAILED'),

    [actionTypes.RESEND_EMAIL_FULFILLED]: (state, { meta: { userId } }) =>
      state.setIn([userId, 'resending'], 'FULFILLED'),
  },
  initialState
);

export default reducer;
