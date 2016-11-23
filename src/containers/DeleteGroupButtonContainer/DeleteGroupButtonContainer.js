import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { groupSelector } from '../../redux/selectors/groups';
import DeleteGroupButton, { DeletingGroupButton, DeletedGroupButton, DeletingGroupFailedButton } from '../../components/Groups/DeleteGroupButton';
import { getJsData, isReady, isLoading } from '../../redux/helpers/resourceManager';
import { deleteGroup } from '../../redux/modules/groups';

const DeleteGroupButtonContainer = ({
  group,
  deleteGroup,
  ...props
}) => {
  if (!group) {
    return <DeletedGroupButton {...props} />;
  }

  if (isReady(group)) {
    return <DeleteGroupButton {...props} {...getJsData(group)} onClick={deleteGroup} />;
  }

  if (isLoading(group)) {
    return <DeletingGroupButton {...props} />;
  }

  return <DeletingGroupFailedButton {...props} onClick={deleteGroup} />;
};

DeleteGroupButtonContainer.propTypes = {
  group: ImmutablePropTypes.map,
  groupId: PropTypes.string.isRequired,
  deleteGroup: PropTypes.func.isRequired
};

export default connect(
  (state, { groupId }) => ({
    group: groupSelector(groupId)(state)
  }),
  (dispatch, { groupId }) => ({
    deleteGroup: () => dispatch(deleteGroup(groupId))
  })
)(DeleteGroupButtonContainer);
