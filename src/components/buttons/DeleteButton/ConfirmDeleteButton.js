import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '../../widgets/FlatButton';
import { DeleteIcon } from '../../icons';
import Confirm from '../../forms/Confirm';

const ConfirmDeleteButton = ({
  id,
  onClick,
  disabled,
  small = true,
  question = (
    <FormattedMessage
      id="app.deleteButton.confirm"
      defaultMessage="Are you sure you want to delete the resource? This cannot be undone."
    />
  ),
  ...props
}) =>
  <Confirm id={id} onConfirmed={onClick} question={question}>
    <Button
      disabled={disabled || !id}
      bsStyle="danger"
      bsSize={small ? 'sm' : undefined}
      {...props}
    >
      <DeleteIcon gapRight />
      <FormattedMessage id="generic.delete" defaultMessage="Delete" />
    </Button>
  </Confirm>;

ConfirmDeleteButton.propTypes = {
  onClick: PropTypes.func,
  id: PropTypes.string,
  small: PropTypes.bool,
  question: PropTypes.any,
  disabled: PropTypes.bool
};

export default ConfirmDeleteButton;
