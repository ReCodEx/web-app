import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const JoinGroupButton = ({ onClick, ...props }) =>
  <Button {...props} onClick={onClick} bsStyle="success" className="btn-flat">
    <FontAwesomeIcon icon="user-plus" />{' '}
    <FormattedMessage
      id="app.groups.joinGroupButton"
      defaultMessage="Join group"
    />
  </Button>;

JoinGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default JoinGroupButton;
