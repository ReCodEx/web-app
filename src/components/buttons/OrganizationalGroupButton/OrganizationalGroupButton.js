import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { GroupIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/FlatButton';

const OrganizationalGroupButton = ({ organizational, pending, disabled = false, setOrganizational }) => (
  <Button
    bsStyle={disabled ? 'default' : 'info'}
    onClick={setOrganizational(!organizational)}
    disabled={pending || disabled}>
    {pending ? <LoadingIcon gapRight /> : <GroupIcon organizational={!organizational} gapRight />}
    {organizational ? (
      <FormattedMessage id="app.organizationalGroupButton.unset" defaultMessage="Change to Regular Group" />
    ) : (
      <FormattedMessage id="app.organizationalGroupButton.set" defaultMessage="Change to Organizational Group" />
    )}
  </Button>
);

OrganizationalGroupButton.propTypes = {
  organizational: PropTypes.bool.isRequired,
  pending: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  setOrganizational: PropTypes.func.isRequired,
};

export default OrganizationalGroupButton;
