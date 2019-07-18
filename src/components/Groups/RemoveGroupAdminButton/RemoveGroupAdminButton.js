import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { UserIcon } from '../../icons';

const RemoveGroupAdminButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} bsStyle="danger" className="btn-flat">
    <UserIcon gapRight />
    <FormattedMessage id="app.groups.removeGroupAdminButton" defaultMessage="Suspend to supervisor" />
  </Button>
);

RemoveGroupAdminButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default RemoveGroupAdminButton;
