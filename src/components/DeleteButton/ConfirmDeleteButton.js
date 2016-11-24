import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { DeleteIcon } from '../Icons';
import Confirm from '../Forms/Confirm';

const ConfirmDeleteButton = ({
  id,
  childGroups,
  onClick,
  disabled,
  question = <FormattedMessage id='app.deleteButton.confirm' defaultMessage='Are you sure you want to delete the resource? This cannot be undone.' />,
  ...props
}) => (
  <Confirm
    id={id}
    onConfirmed={onClick}
    question={question}>
    <Button disabled={disabled || !id || childGroups.all.length > 0} bsStyle='danger' bsSize='sm' className='btn-flat' {...props}>
      <DeleteIcon /> <FormattedMessage id='app.deleteButton.delete' defaultMessage='Delete' />
    </Button>
  </Confirm>
);

ConfirmDeleteButton.propTypes = {
  onClick: PropTypes.func,
  id: PropTypes.string.isRequired,
  childGroups: PropTypes.object.isRequired,
  question: PropTypes.any,
  disabled: PropTypes.bool
};

export default ConfirmDeleteButton;
