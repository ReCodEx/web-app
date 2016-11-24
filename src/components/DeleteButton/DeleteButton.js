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
  ...props
}) => {
  if (isDeleted(resource)) {
    return <DeletedButton {...props} />;
  }

  if (isLoading(resource)) {
    return <ConfirmDeleteButton {...props} onClick={() => {}} />;
  }

  if (isReady(resource)) {
    const { id, childGroups } = getJsData(resource);
    return <ConfirmDeleteButton {...props} id={id} disabled={childGroups && childGroups.length > 0} onClick={deleteResource} />;
  }

  if (isDeleting(resource)) {
    return <DeletingButton {...props} />;
  }

  return <DeletingFailedButton {...props} onClick={deleteResource} />;
};

DeleteButton.propTypes = {
  resource: ImmutablePropTypes.map,
  deleteResource: PropTypes.func.isRequired
};

export default DeleteButton;
