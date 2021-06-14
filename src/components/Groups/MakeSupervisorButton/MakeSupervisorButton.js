import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import Icon from '../../icons';

const MakeSupervisorButton = ({ onClick, ...props }) => (
  <Button {...props} onClick={onClick} variant="success">
    <Icon icon="user-plus" gapRight />
    <FormattedMessage id="app.groups.makeSupervisorButton" defaultMessage="Make supervisor" />
  </Button>
);

MakeSupervisorButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default MakeSupervisorButton;
