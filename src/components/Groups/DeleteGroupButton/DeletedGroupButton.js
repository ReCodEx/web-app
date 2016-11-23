import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { SuccessIcon } from '../../Icons';

const DeletedGroupButton = (props) => (
  <Button bsStyle='success' bsSize='sm' {...props}>
    <SuccessIcon /> <FormattedMessage id='app.deleteGroupButton.deleted' defaultMessage='Group is being deleted' />
  </Button>
);

export default DeletedGroupButton;
