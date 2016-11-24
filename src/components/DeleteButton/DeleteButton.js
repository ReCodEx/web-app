import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ConfirmDeleteButton from './ConfirmDeleteButton';
import DeletingButton from './DeletingButton';
import DeletedButton from './DeletedButton';
import DeletingFailedButton from './DeletingFailedButton';
import { getId, isReady, isLoading, isDeleting } from '../../redux/helpers/resourceManager';

const DeleteButton = ({
  resource,
  deleteResource,
  ...props
}) => {
  if (!resource) {
    return <DeletedButton {...props} />;
  }

  if (isLoading(resource)) {
    return <ConfirmDeleteButton {...props} />;
  }

  if (isReady(resource)) {
    return <ConfirmDeleteButton {...props} id={getId(resource)} onClick={deleteResource} />;
  }

  if (isDeleting(resource)) {
    return <DeletingButton {...props} />;
  }

  return <DeletingFailedButton {...props} onClick={deleteResource} />;
};

DeleteButton.propTypes = {
  resource: ImmutablePropTypes.map,
  id: PropTypes.string.isRequired,
  deleteActionCreator: PropTypes.func.isRequired,
  deleteResource: PropTypes.func.isRequired
};

export default DeleteButton;
