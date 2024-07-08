import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import DeleteButton from '../../components/buttons/DeleteButton';
import { deleteGroup } from '../../redux/modules/groups.js';
import { groupSelector } from '../../redux/selectors/groups.js';

const DeleteGroupButtonContainer = ({ group, deleteGroup, onDeleted, ...props }) => (
  <DeleteButton {...props} resource={group} deleteAction={deleteGroup} />
);

DeleteGroupButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  deleteGroup: PropTypes.func.isRequired,
  onDeleted: PropTypes.func,
};

export default connect(
  (state, { id }) => ({
    group: groupSelector(state, id),
  }),
  (dispatch, { id, onDeleted }) => ({
    deleteGroup: () => {
      onDeleted && onDeleted();
      return dispatch(deleteGroup(id));
    },
  })
)(DeleteGroupButtonContainer);
