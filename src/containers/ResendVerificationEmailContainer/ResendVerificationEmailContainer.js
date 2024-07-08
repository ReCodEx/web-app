import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { resendVerificationEmail } from '../../redux/modules/emailVerification.js';
import { resendingStatusSelector } from '../../redux/selectors/emailVerification.js';
import ResendEmailVerification from '../../components/buttons/ResendEmailVerification';

const ResendVerificationEmailContainer = ({ userId, state, resend, ...props }) => (
  <ResendEmailVerification resend={resend} state={state} {...props} />
);

ResendVerificationEmailContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  state: PropTypes.string,
  resend: PropTypes.func.isRequired,
  intl: PropTypes.object,
};

export default connect(
  (state, { userId }) => ({
    state: resendingStatusSelector(userId)(state),
  }),
  (dispatch, { userId }) => ({
    resend: () => dispatch(resendVerificationEmail(userId)),
  })
)(injectIntl(ResendVerificationEmailContainer));
