import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { WarningIcon } from '../../icons';
import Button from '../../widgets/FlatButton';

const NotVerified = ({ userId, currentUserId }) => {
  return (
    <OverlayTrigger
      trigger="click"
      rootClose="true"
      overlay={
        <Popover
          id={userId}
          title={
            <FormattedMessage
              id="app.usersName.notVerified.title"
              defaultMessage="This account does not have a verified email address yet."
            />
          }
        >
          <p>
            <FormattedMessage
              id="app.usersname.notVerified.description"
              defaultMessage="This user has not verified his/her email address via an activation link he has received to his email address."
            />
          </p>
          {userId === currentUserId &&
            <p className="text-center">
              <Button>
                <FormattedMessage
                  id="app.usersName.notVerified.resend"
                  defaultMessage="Re-send the activation link"
                />
              </Button>
            </p>}
        </Popover>
      }
    >
      <span>{' '}<WarningIcon className="text-warning" /></span>
    </OverlayTrigger>
  );
};

NotVerified.propTypes = {
  userId: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired
};

export default NotVerified;
