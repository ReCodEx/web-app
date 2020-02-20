import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deleteShadowAssignment } from '../../redux/modules/shadowAssignments';
import { getShadowAssignment } from '../../redux/selectors/shadowAssignments';

const DeleteShadowAssignmentButtonContainer = ({ shadowAssignment, deleteShadowAssignment, onDeleted, ...props }) => (
  <DeleteButton {...props} resource={shadowAssignment} deleteAction={deleteShadowAssignment} />
);

DeleteShadowAssignmentButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  shadowAssignment: ImmutablePropTypes.map,
  deleteShadowAssignment: PropTypes.func.isRequired,
  onDeleted: PropTypes.func,
};

export default connect(
  (state, { id }) => ({
    shadowAssignment: getShadowAssignment(state)(id),
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteShadowAssignment: () => dispatch(deleteShadowAssignment(id)).then(() => onDeleted && onDeleted()),
  })
)(DeleteShadowAssignmentButtonContainer);
