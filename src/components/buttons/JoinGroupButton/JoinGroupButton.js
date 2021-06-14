import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';

const JoinGroupButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} variant="success">
    <Icon icon="user-plus" gapRight />
    <FormattedMessage id="app.groups.joinGroupButton" defaultMessage="Join group" />
  </Button>
);

JoinGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default JoinGroupButton;
