import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { LoadingIcon, LockIcon, UnlockIcon } from '../../icons';
import Confirm from '../../forms/Confirm';

const AllowUserButton = ({ id, isAllowed, pending = false, setIsAllowed, disabled = false, ...props }) => (
  <Confirm
    id={`allow-${id}`}
    onConfirmed={() => setIsAllowed(!isAllowed)}
    question={
      isAllowed ? (
        <FormattedMessage
          id="app.allowUserButton.confirmDisallow"
          defaultMessage="If you disable the account, the user will not be able to perform any operation nor access any data. Do you wish to disable it?"
        />
      ) : (
        <FormattedMessage
          id="app.allowUserButton.confirmAllow"
          defaultMessage="The user may have been disabled for a reason. Do you really wish to enable the account?"
        />
      )
    }>
    <Button disabled={disabled || pending || pending === null} bsStyle={isAllowed ? 'danger' : 'success'} {...props}>
      {pending ? <LoadingIcon gapRight /> : isAllowed ? <LockIcon gapRight /> : <UnlockIcon gapRight />}
      {isAllowed ? (
        <FormattedMessage id="generic.disable" defaultMessage="Disable" />
      ) : (
        <FormattedMessage id="generic.enable" defaultMessage="Enable" />
      )}
    </Button>
  </Confirm>
);

AllowUserButton.propTypes = {
  id: PropTypes.string.isRequired,
  isAllowed: PropTypes.bool.isRequired,
  pending: PropTypes.bool,
  setIsAllowed: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default AllowUserButton;
