import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from 'react-fontawesome';
import Confirm from '../../forms/Confirm';

const RemoveFromGroupButton = ({ onClick, ...props }) =>
  <Confirm
    id={'confirm'}
    onConfirmed={onClick}
    question={
      <FormattedMessage
        id="app.removeFromGroup.confirm"
        defaultMessage="Are you sure you want to remove the user from this group?"
      />
    }
  >
    <Button {...props} bsStyle="warning" className="btn-flat">
      <Icon name="user-times" />{' '}
      <FormattedMessage
        id="app.groups.removeFromGroup"
        defaultMessage="Remove from group"
      />
    </Button>
  </Confirm>;

RemoveFromGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default RemoveFromGroupButton;
