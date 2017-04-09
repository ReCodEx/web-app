import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../AdminLTE/FlatButton';
import { FailedIcon } from '../Icons';

const DeletingGroupFailedButton = ({ onClick, ...props }) => (
  <Button
    bsStyle="default"
    bsSize="sm"
    className="btn-flat"
    onClick={onClick}
    {...props}
  >
    <FailedIcon />
    {' '}
    <FormattedMessage
      id="app.deleteButton.deleting"
      defaultMessage="Deleting failed"
    />
  </Button>
);

DeletingGroupFailedButton.propTypes = {
  onClick: PropTypes.func
};

export default DeletingGroupFailedButton;
