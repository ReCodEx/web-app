import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { DeleteIcon } from '../../icons';
import Confirm from '../../Forms/Confirm';

const ConfirmDeleteButton = (
  {
    id,
    onClick,
    disabled,
    question = (
      <FormattedMessage
        id="app.deleteButton.confirm"
        defaultMessage="Are you sure you want to delete the resource? This cannot be undone."
      />
    ),
    ...props
  }
) => (
  <Confirm id={id} onConfirmed={onClick} question={question}>
    <Button disabled={disabled || !id} bsStyle="danger" bsSize="sm" {...props}>
      <DeleteIcon />
      {' '}
      <FormattedMessage id="app.deleteButton.delete" defaultMessage="Delete" />
    </Button>
  </Confirm>
);

ConfirmDeleteButton.propTypes = {
  onClick: PropTypes.func,
  id: PropTypes.string,
  question: PropTypes.any,
  disabled: PropTypes.bool
};

export default ConfirmDeleteButton;
