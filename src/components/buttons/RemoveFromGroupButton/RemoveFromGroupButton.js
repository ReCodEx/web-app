import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/TheButton';
import Icon from '../../icons';
import Confirm from '../../forms/Confirm';

const RemoveFromGroupButton = ({ onClick, ...props }) => (
  <Confirm
    id={'confirm'}
    onConfirmed={onClick}
    question={
      <FormattedMessage
        id="app.removeFromGroup.confirm"
        defaultMessage="Are you sure you want to remove the user from this group?"
      />
    }>
    <Button {...props} variant="warning">
      <Icon icon="user-times" gapRight />
      <FormattedMessage id="app.groups.removeFromGroup" defaultMessage="Remove from group" />
    </Button>
  </Confirm>
);

RemoveFromGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default RemoveFromGroupButton;
