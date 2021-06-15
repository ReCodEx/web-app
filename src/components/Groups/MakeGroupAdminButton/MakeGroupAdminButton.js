import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/TheButton';
import Icon from '../../icons';

const MakeGroupAdminButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} variant="success">
    <Icon icon="user-secret" gapRight />
    <FormattedMessage id="app.groups.makeGroupAdminButton" defaultMessage="Promote to group admin" />
  </Button>
);

MakeGroupAdminButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default MakeGroupAdminButton;
