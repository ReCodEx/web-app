import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const RemoveGroupAdminButton = ({ onClick, ...props }) =>
  <Button {...props} onClick={onClick} bsStyle="danger" className="btn-flat">
    <FontAwesomeIcon icon="user-secret" />{' '}
    <FormattedMessage
      id="app.groups.removeGroupAdminButton"
      defaultMessage="Remove group admin"
    />
  </Button>;

RemoveGroupAdminButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default RemoveGroupAdminButton;
