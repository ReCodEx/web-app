import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../widgets/FlatButton';
import { LoadingIcon } from '../Icons';

const DeletingGroupButton = props => (
  <Button bsStyle="default" bsSize="sm" className="btn-flat" {...props}>
    <LoadingIcon />
    {' '}
    <FormattedMessage
      id="app.deleteButton.deleting"
      defaultMessage="Deleting ..."
    />
  </Button>
);

export default DeletingGroupButton;
