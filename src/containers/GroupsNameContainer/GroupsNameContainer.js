import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchPublicGroupIfNeeded } from '../../redux/modules/publicGroups';
import { publicGroupSelector } from '../../redux/selectors/publicGroups';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
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
    dispatch(fetchPublicGroupIfNeeded(groupId));
  };

  render() {
    const { group, noLink } = this.props;
    return (
      <ResourceRenderer resource={group} loading={<LoadingGroupsName />}>
        {group => <GroupsName {...group} noLink={noLink || !group.canView} />}
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
    group: publicGroupSelector(groupId)(state)
  }),
  (dispatch, { groupId }) => ({
    loadAsync: () => GroupsNameContainer.loadAsync({ groupId }, dispatch)
  })
)(GroupsNameContainer);
