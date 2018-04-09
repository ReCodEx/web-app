import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import ConfirmDeleteButton from '../../components/buttons/DeleteButton/ConfirmDeleteButton';
import { deleteUser } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';

const DeleteUserButtonContainer = ({
  resourceless = false,
  user,
  deleteUser,
  onDeleted,
  ...props
}) =>
  resourceless
    ? <ConfirmDeleteButton {...props} onClick={deleteUser} />
    : <DeleteButton {...props} resource={user} deleteResource={deleteUser} />;

DeleteUserButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  resourceless: PropTypes.bool,
  user: ImmutablePropTypes.map,
  deleteUser: PropTypes.func.isRequired,
  onDeleted: PropTypes.func
};

export default connect(
  (state, { id }) => ({
    user: getUser(id)(state)
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteUser: () =>
      dispatch(deleteUser(id)).then(() => onDeleted && onDeleted())
  })
)(DeleteUserButtonContainer);
