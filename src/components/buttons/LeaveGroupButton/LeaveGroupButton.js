import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/TheButton';
import Icon from '../../icons';
import Confirm from '../../forms/Confirm';

const LeaveGroupButton = ({ onClick, ...props }) => (
  <Confirm
    id={'confirm'}
    onConfirmed={onClick}
    question={
      <FormattedMessage id="app.leaveGroup.confirm" defaultMessage="Are you sure you want to leave this group?" />
    }>
    <Button {...props} onClick={onClick} variant="warning">
      <Icon icon="user-times" gapRight={2} />
      <FormattedMessage id="app.groups.leaveGroupButton" defaultMessage="Leave group" />
    </Button>
  </Confirm>
);

LeaveGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default LeaveGroupButton;
