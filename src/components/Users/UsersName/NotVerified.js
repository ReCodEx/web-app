import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { WarningIcon } from '../../icons';
import ResendVerificationEmail from '../../../containers/ResendVerificationEmailContainer';

const NotVerified = ({ userId, currentUserId }) => {
  return (
    <OverlayTrigger
      trigger="click"
      rootClose={true}
      placement="bottom"
      overlay={
        <Popover id={userId}>
          <Popover.Header>
            <FormattedMessage
              id="app.usersName.notVerified.title"
              defaultMessage="This account does not have a verified email address yet."
            />
          </Popover.Header>
          <Popover.Body>
            <p>
              <FormattedMessage
                id="app.usersname.notVerified.description"
                defaultMessage="This user has not verified his/her email address via an activation link he has received to his email address."
              />
            </p>
            {userId === currentUserId && (
              <p className="text-center">
                <ResendVerificationEmail userId={userId} />
              </p>
            )}
          </Popover.Body>
        </Popover>
      }>
      <span>
        <WarningIcon className="text-warning" gapLeft />
      </span>
    </OverlayTrigger>
  );
};

NotVerified.propTypes = {
  userId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
};

export default NotVerified;
