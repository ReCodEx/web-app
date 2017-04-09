import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../AdminLTE/FlatButton';
import { SuccessIcon } from '../Icons';

const DeletedGroupButton = props => (
  <Button bsStyle="default" bsSize="sm" {...props}>
    <SuccessIcon />
    {' '}
    <FormattedMessage id="app.deleteButton.deleted" defaultMessage="Deleted." />
  </Button>
);

export default DeletedGroupButton;
