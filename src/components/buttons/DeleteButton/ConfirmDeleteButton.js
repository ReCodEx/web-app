import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Confirm from '../../forms/Confirm';
import DeleteButtonRaw from './DeleteButtonRaw';

const ConfirmDeleteButton = ({
  id,
  onClick,
  question = (
    <FormattedMessage
      id="app.deleteButton.confirm"
      defaultMessage="Are you sure you want to delete the resource? This cannot be undone."
    />
  ),
  ...props
}) => (
  <Confirm id={id} onConfirmed={onClick} question={question}>
    <DeleteButtonRaw id={id} {...props} />
  </Confirm>
);

ConfirmDeleteButton.propTypes = {
  onClick: PropTypes.func,
  id: PropTypes.string,
  question: PropTypes.any,
};

export default ConfirmDeleteButton;
