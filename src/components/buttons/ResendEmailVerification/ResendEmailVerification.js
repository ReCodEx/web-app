import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { MailIcon, SuccessIcon, LoadingIcon, FailureIcon } from '../../icons';
import TheButton from '../../widgets/TheButton';
import { resourceStatus } from '../../../redux/helpers/resourceManager';

const bsStyles = {
  [resourceStatus.FULFILLED]: 'success',
  [resourceStatus.FAILED]: 'danger',
};

const icons = {
  [resourceStatus.PENDING]: <LoadingIcon gapRight={2} />,
  [resourceStatus.FULFILLED]: <SuccessIcon gapRight={2} />,
  [resourceStatus.FAILED]: <FailureIcon gapRight={2} />,
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
    <TheButton
      onClick={state !== resourceStatus.PENDING ? resend : undefined}
      variant={bsStyles[state] || 'primary'}
      {...props}>
      {icons[state] || <MailIcon gapRight={2} />}
      {messages[state] ? (
        formatMessage(messages[state])
      ) : (
        <FormattedMessage id="app.resendEmailVerification.resend" defaultMessage="Resend verification email" />
      )}
    </TheButton>
  );
};

ResendEmailVerification.propTypes = {
  resend: PropTypes.func.isRequired,
  state: PropTypes.string,
  intl: PropTypes.object,
};

export default injectIntl(ResendEmailVerification);
