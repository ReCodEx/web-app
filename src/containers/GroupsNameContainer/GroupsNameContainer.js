import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { hasPermissions } from '../../helpers/common';
import GroupsName, {
  LoadingGroupsName
} from '../../components/Groups/GroupsName';

class GroupsNameContainer extends Component {
  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.groupId !== newProps.groupId) {
      newProps.loadAsync();
    }
  }

  static loadAsync = ({ groupId }, dispatch) => {
    dispatch(fetchGroupIfNeeded(groupId));
  };

  render() {
    const { group, noLink } = this.props;
    return (
      <ResourceRenderer resource={group} loading={<LoadingGroupsName />}>
        {group => <GroupsName {...group} noLink={noLink || !hasPermissions(group, 'viewDetail')} />}
      </ResourceRenderer>
    );
  }
}

GroupsNameContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  noLink: PropTypes.bool,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { groupId }) => ({
    group: groupSelector(groupId)(state)
  }),
  (dispatch, { groupId }) => ({
    loadAsync: () => GroupsNameContainer.loadAsync({ groupId }, dispatch)
  })
)(GroupsNameContainer);
