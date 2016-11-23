import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { DeleteIcon } from '../../Icons';
import Confirm from '../../Forms/Confirm';

const DeleteGroupButton = ({ id, name, onClick, ...props }) => (
  <Confirm
    id={id}
    onConfirmed={onClick}
    question={
      <FormattedMessage
        id='app.deleteGroupButton.confirm'
        defaultMessage='Do you really want to delete group {name}? This cannot be undone.'
        values={{ name }} />
    }>
    <Button bsStyle='danger' bsSize='sm' {...props}>
      <DeleteIcon /> <FormattedMessage id='app.deleteGroupButton.delete' defaultMessage='Delete' />
    </Button>
  </Confirm>
);

DeleteGroupButton.propTypes = {
  onClick: PropTypes.func,
  name: PropTypes.string.isRequired,
  id: PropTypes.string.isRequired
};

export default DeleteGroupButton;
