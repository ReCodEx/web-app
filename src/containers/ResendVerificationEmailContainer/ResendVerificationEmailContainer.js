import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { resendVerificationEmail } from '../../redux/modules/emailVerification';
import { resendingStatusSelector } from '../../redux/selectors/emailVerification';
import ResendEmail, {
  EmailResent,
  ResendingFailed,
  ResendingEmail,
} from '../../components/buttons/ResendEmailVerification';

const ResendVerificationEmailContainer = ({ userId, state, resend, ...props }) => {
  switch (state) {
    case 'PENDING':
      return <ResendingEmail {...props} />;
    case 'FULFILLED':
      return <EmailResent resend={resend} {...props} />;
    case 'FAILED':
      return <ResendingFailed resend={resend} {...props} />;
    default:
      return <ResendEmail resend={resend} {...props} />;
  }
};

ResendVerificationEmailContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  state: PropTypes.string,
  resend: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { userId }) => ({
  state: resendingStatusSelector(userId)(state),
});

const mapDispatchToProps = (dispatch, { userId }) => ({
  resend: () => dispatch(resendVerificationEmail(userId)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ResendVerificationEmailContainer);
