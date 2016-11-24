import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/DeleteButton';
import { deleteAssignment } from '../../redux/modules/assignments';
import { getAssignment } from '../../redux/selectors/assignments';

const DeleteAssignmentButtonContainer = ({
  assignment,
  deleteAssignment,
  ...props
}) => (
  <DeleteButton {...props} resource={assignment} deleteResource={deleteAssignment} />
);

DeleteAssignmentButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  assignment: ImmutablePropTypes.map,
  deleteAssignment: PropTypes.func.isRequired
};

export default connect(
  (state, { id }) => ({
    assignment: getAssignment(id)(state)
  }),
  (dispatch, { id }) => ({
    deleteAssignment: () => dispatch(deleteAssignment(id))
  })
)(DeleteAssignmentButtonContainer);
