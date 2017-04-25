import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { FailedIcon } from '../../icons';

const DeletingFailedButton = ({ onClick, ...props }) => (
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

DeletingFailedButton.propTypes = {
  onClick: PropTypes.func
};

export default DeletingFailedButton;
