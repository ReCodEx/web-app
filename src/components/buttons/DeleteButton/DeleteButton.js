import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import ConfirmDeleteButton from './ConfirmDeleteButton';
import DeletingButton from './DeletingButton';
import DeletedButton from './DeletedButton';
import DeletingFailedButton from './DeletingFailedButton';
import {
  isReady,
  isLoading,
  isDeleting,
  isDeleted,
} from '../../../redux/helpers/resourceManager';

const DeleteButton = ({ resource, deleteResource, disabled, ...props }) => {
  if (!resource || isDeleted(resource)) {
    return <DeletedButton {...props} disabled={disabled} />;
  }

  if (isLoading(resource)) {
    return (
      <ConfirmDeleteButton {...props} disabled={disabled} onClick={() => {}} />
    );
  }

  if (isReady(resource)) {
    return (
      <ConfirmDeleteButton
        {...props}
        disabled={disabled}
        onClick={deleteResource}
      />
    );
  }

  if (isDeleting(resource)) {
    return <DeletingButton {...props} disabled={disabled} />;
  }

  return (
    <DeletingFailedButton
      {...props}
      onClick={deleteResource}
      disabled={disabled}
    />
  );
};

DeleteButton.propTypes = {
  resource: ImmutablePropTypes.map,
  deleteResource: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default DeleteButton;
