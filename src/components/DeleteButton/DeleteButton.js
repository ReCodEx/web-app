import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ConfirmDeleteButton from './ConfirmDeleteButton';
import DeletingButton from './DeletingButton';
import DeletedButton from './DeletedButton';
import DeletingFailedButton from './DeletingFailedButton';
import { getJsData, isReady, isLoading, isDeleting, isDeleted } from '../../redux/helpers/resourceManager';

const DeleteButton = ({
  resource,
  deleteResource,
  disabled,
  ...props
}) => {
  if (isDeleted(resource)) {
    return <DeletedButton {...props} disabled={disabled} />;
  }

  if (isLoading(resource)) {
    return <ConfirmDeleteButton {...props} disabled={disabled} onClick={() => {}} />;
  }

  if (isReady(resource)) {
    const { id, childGroups } = getJsData(resource);
    return <ConfirmDeleteButton {...props} id={id} disabled={disabled || (childGroups && childGroups.length > 0)} onClick={deleteResource} />;
  }

  if (isDeleting(resource)) {
    return <DeletingButton {...props} disabled={disabled} />;
  }

  return <DeletingFailedButton {...props} onClick={deleteResource} disabled={disabled} />;
};

DeleteButton.propTypes = {
  resource: ImmutablePropTypes.map,
  deleteResource: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default DeleteButton;
