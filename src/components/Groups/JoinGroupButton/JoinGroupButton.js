import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../AdminLTE/FlatButton';
import Icon from 'react-fontawesome';

const JoinGroupButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} bsStyle="success" className="btn-flat">
    <Icon name="user-plus" />
    {' '}
    <FormattedMessage
      id="app.groups.joinGroupButton"
      defaultMessage="Join group"
    />
  </Button>
);

JoinGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default JoinGroupButton;
