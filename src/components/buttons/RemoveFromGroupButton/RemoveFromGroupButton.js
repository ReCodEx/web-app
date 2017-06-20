import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from 'react-fontawesome';

const RemoveFromGroupButton = ({ onClick, ...props }) =>
  <Button {...props} onClick={onClick} bsStyle="warning" className="btn-flat">
    <Icon name="user-times" />
    {' '}
    <FormattedMessage
      id="app.groups.removeFromGroup"
      defaultMessage="Remove from group"
    />
  </Button>;

RemoveFromGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default RemoveFromGroupButton;
