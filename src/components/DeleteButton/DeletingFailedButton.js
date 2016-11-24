import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { FailedIcon } from '../Icons';

const DeletingGroupFailedButton = ({ onClick, ...props }) => (
  <Button bsStyle='default' bsSize='sm' onClick={onClick} {...props} disabled>
    <FailedIcon /> <FormattedMessage id='app.deleteGroupButton.deleting' defaultMessage='Group was deleted' />
  </Button>
);

DeletingGroupFailedButton.propTypes = {
  onClick: PropTypes.func
};

export default DeletingGroupFailedButton;
