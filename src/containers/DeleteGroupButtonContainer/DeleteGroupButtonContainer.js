import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deleteGroup } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';

const DeleteGroupButtonContainer = (
  {
    group,
    deleteGroup,
    onDeleted,
    ...props
  }
) => <DeleteButton {...props} resource={group} deleteResource={deleteGroup} />;

DeleteGroupButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  deleteGroup: PropTypes.func.isRequired,
  onDeleted: PropTypes.func
};

export default connect(
  (state, { id }) => ({
    group: groupSelector(id)(state)
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteGroup: () =>
      dispatch(deleteGroup(id)).then(() => onDeleted && onDeleted())
  })
)(DeleteGroupButtonContainer);
