import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { GroupIcon, LoadingIcon } from '../../icons';
import Button from '../../widgets/TheButton';

const OrganizationalGroupButton = ({ organizational, pending, disabled = false, setOrganizational, ...props }) => (
  <Button
    {...props}
    variant={disabled ? 'secondary' : 'info'}
    onClick={setOrganizational}
    disabled={pending || disabled}>
    {pending ? <LoadingIcon gapRight /> : <GroupIcon organizational={!organizational} gapRight />}
    {organizational ? (
      <FormattedMessage id="app.groupTypeButton.regular" defaultMessage="Regular" />
    ) : (
      <FormattedMessage id="app.groupTypeButton.organizational" defaultMessage="Organizational" />
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
