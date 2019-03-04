import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, intlShape, injectIntl } from 'react-intl';
import { MailIcon, SuccessIcon, LoadingIcon, FailureIcon } from '../../icons';
import FlatButton from '../../widgets/FlatButton';
import { resourceStatus } from '../../../redux/helpers/resourceManager';

const bsStyles = {
  [resourceStatus.FULFILLED]: 'success',
  [resourceStatus.FAILED]: 'danger',
};

const icons = {
  [resourceStatus.PENDING]: <LoadingIcon gapRight />,
  [resourceStatus.FULFILLED]: <SuccessIcon gapRight />,
  [resourceStatus.FAILED]: <FailureIcon gapRight />,
};

const messages = defineMessages({
  [resourceStatus.PENDING]: {
    id: 'app.resendEmailVerification.resending',
    defaultMessage: 'Sending email...',
  },
  [resourceStatus.FULFILLED]: {
    id: 'app.resendEmailVerification.resent',
    defaultMessage: 'Email has been resent',
  },
  [resourceStatus.FAILED]: {
    id: 'app.resendEmailVerification.failed',
    defaultMessage: 'Resending failed',
  },
});

const ResendEmailVerification = ({ resend, state, intl: { formatMessage }, ...props }) => {
  return (
    <FlatButton
      onClick={state !== resourceStatus.PENDING ? resend : undefined}
      bsStyle={bsStyles[state] || 'primary'}
      {...props}>
      {icons[state] || <MailIcon gapRight />}
      {messages[state] ? (
        formatMessage(messages[state])
      ) : (
        <FormattedMessage id="app.resendEmailVerification.resend" defaultMessage="Resend verification email" />
      )}
    </FlatButton>
  );
};

ResendEmailVerification.propTypes = {
  resend: PropTypes.func.isRequired,
  intl: intlShape,
};

export default injectIntl(ResendEmailVerification);
