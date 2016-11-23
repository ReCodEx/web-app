import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { LoadingIcon } from '../../Icons';

const DeletingGroupButton = (props) => (
  <Button bsStyle='default' bsSize='sm' {...props}>
    <LoadingIcon /> <FormattedMessage id='app.deleteGroupButton.deleting' defaultMessage='Group was deleted' />
  </Button>
);

export default DeletingGroupButton;
