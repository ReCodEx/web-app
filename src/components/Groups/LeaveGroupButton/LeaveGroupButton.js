import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from 'react-fontawesome';

const LeaveGroupButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} bsStyle="warning" className="btn-flat">
    <Icon name="user-times" />
    {' '}
    <FormattedMessage
      id="app.groups.leaveGroupButton"
      defaultMessage="Leave group"
    />
  </Button>
);

LeaveGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default LeaveGroupButton;
