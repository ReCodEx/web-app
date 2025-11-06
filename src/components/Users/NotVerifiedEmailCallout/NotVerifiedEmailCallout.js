import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import ResendVerificationEmail from '../../../containers/ResendVerificationEmailContainer';
import RefreshButton from '../../buttons/RefreshButton/RefreshButton';
import Callout from '../../widgets/Callout';
import { TheButtonGroup } from '../../widgets/TheButton';

const NotVerifiedEmailCallout = ({ userId, refreshUser }) => (
  <Callout variant="warning">
    <h3>
      <FormattedMessage id="app.editUser.emailStillNotVerifiedTitle" defaultMessage="Email Address Is Not Verified" />
    </h3>
    <p>
      <FormattedMessage
        id="app.editUser.emailStillNotVerified"
        defaultMessage="Your email address has not been verified yet. ReCodEx needs to rely on valid addresses since many notifications are sent via email. You may send yourself a validation email using the button below and then use a link from that email to verify its acceptance. Please validate your address as soon as possible."
      />
    </p>
    <p>
      <FormattedMessage
        id="app.editUser.isEmailAlreadyVerified"
        defaultMessage="If you have just verified your email and still see the message, please refresh the page."
      />
    </p>
    <TheButtonGroup className="mb-2">
      <ResendVerificationEmail userId={userId} />
      <RefreshButton onClick={refreshUser} variant="outline-secondary" />
    </TheButtonGroup>
  </Callout>
);

NotVerifiedEmailCallout.propTypes = {
  userId: PropTypes.string.isRequired,
  refreshUser: PropTypes.func.isRequired,
};

export default NotVerifiedEmailCallout;
