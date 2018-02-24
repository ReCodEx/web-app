import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { SuccessIcon } from '../../icons';

const DeletedGroupButton = props =>
  <Button bsStyle="default" bsSize="sm" {...props}>
    <SuccessIcon />{' '}
    <FormattedMessage id="generic.deleted" defaultMessage="Deleted" />
  </Button>;

export default DeletedGroupButton;
