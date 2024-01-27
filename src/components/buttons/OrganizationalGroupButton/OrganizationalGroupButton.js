import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { GroupIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const OrganizationalGroupButton = ({ organizational, pending, disabled = false, setOrganizational, ...props }) => (
  <div className="text-center">
    <strong>
      <FormattedMessage id="app.organizationalGroupButton.label" defaultMessage="Change type to" />:
    </strong>
    <br />
    <Button
      {...props}
      variant={disabled ? 'secondary' : 'info'}
      onClick={setOrganizational(!organizational)}
      disabled={pending || disabled}>
      {pending ? <LoadingIcon gapRight /> : <GroupIcon organizational={!organizational} gapRight />}
      {organizational ? (
        <FormattedMessage id="app.organizationalGroupButton.unset" defaultMessage="Regular" />
      ) : (
        <FormattedMessage id="app.organizationalGroupButton.set" defaultMessage="Organizational" />
      )}
    </Button>
  </div>
);

OrganizationalGroupButton.propTypes = {
  organizational: PropTypes.bool.isRequired,
  pending: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  setOrganizational: PropTypes.func.isRequired,
};

export default OrganizationalGroupButton;
