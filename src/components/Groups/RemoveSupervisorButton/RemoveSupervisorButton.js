import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';

const RemoveSupervisorButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} variant="warning">
    <Icon icon="user-times" gapRight />
    <FormattedMessage id="app.groups.removeSupervisorButton" defaultMessage="Remove supervisor" />
  </Button>
);

RemoveSupervisorButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default RemoveSupervisorButton;
