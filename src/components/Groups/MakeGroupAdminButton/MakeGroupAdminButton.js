import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

const MakeGroupAdminButton = ({ onClick, ...props }) =>
  <Button {...props} onClick={onClick} bsStyle="success" className="btn-flat">
    <FontAwesomeIcon icon="user-secret" />{' '}
    <FormattedMessage
      id="app.groups.makeGroupAdminButton"
      defaultMessage="Make group admin"
    />
  </Button>;

MakeGroupAdminButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export default MakeGroupAdminButton;
