import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { LoadingIcon } from '../../icons';

const DeletingGroupButton = props =>
  <Button bsStyle="default" bsSize="sm" className="btn-flat" {...props}>
    <LoadingIcon gapRight />
    <FormattedMessage id="generic.deleting" defaultMessage="Deleting..." />
  </Button>;

export default DeletingGroupButton;
