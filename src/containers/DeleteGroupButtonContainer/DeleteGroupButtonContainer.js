import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/DeleteButton';
import { deleteGroup } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';

const DeleteGroupButtonContainer = ({
  group,
  deleteGroup,
  ...props
}) => (
  <DeleteButton {...props} resource={group} deleteResource={deleteGroup} />
);

DeleteGroupButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  deleteGroup: PropTypes.func.isRequired
};

export default connect(
  (state, { id }) => ({
    group: groupSelector(id)(state)
  }),
  (dispatch, { id }) => ({
    deleteGroup: () => dispatch(deleteGroup(id))
  })
)(DeleteGroupButtonContainer);
