import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../AdminLTE/FlatButton';
import Icon from 'react-fontawesome';

const MakeSupervisorButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} bsStyle="success" className="btn-flat">
    <Icon name="user-plus" />
    {' '}
    <FormattedMessage
      id="app.groups.makeSupervisorButton"
      defaultMessage="Make supervisor"
    />
  </Button>
);

MakeSupervisorButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default MakeSupervisorButton;
