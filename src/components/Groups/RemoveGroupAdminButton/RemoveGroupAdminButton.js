import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/TheButton';
import { UserIcon } from '../../icons';

const RemoveGroupAdminButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} variant="danger">
    <UserIcon gapRight />
    <FormattedMessage id="app.groups.removeGroupAdminButton" defaultMessage="Suspend to supervisor" />
  </Button>
);

RemoveGroupAdminButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default RemoveGroupAdminButton;
