import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deleteAssignment } from '../../redux/modules/assignments';
import { getAssignment } from '../../redux/selectors/assignments';

const DeleteAssignmentButtonContainer = ({
  assignment,
  deleteAssignment,
  onDeleted,
  ...props
}) => (
  <DeleteButton
    {...props}
    resource={assignment}
    deleteResource={deleteAssignment}
  />
);

DeleteAssignmentButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  assignment: ImmutablePropTypes.map,
  deleteAssignment: PropTypes.func.isRequired,
  onDeleted: PropTypes.func
};

export default connect(
  (state, { id }) => ({
    assignment: getAssignment(id)(state)
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteAssignment: () =>
      dispatch(deleteAssignment(id)).then(() => onDeleted && onDeleted())
  })
)(DeleteAssignmentButtonContainer);
