import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import GroupsName, {
  LoadingGroupsName
} from '../../components/Groups/GroupsName';

class GroupsNameContainer extends Component {
  componentWillMount() {
    GroupsNameContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.groupId !== newProps.groupId) {
      GroupsNameContainer.loadData(newProps);
    }
  }

  static loadData = ({ loadGroupIfNeeded }) => {
    loadGroupIfNeeded();
  };

  render() {
    const { group, noLink } = this.props;
    return (
      <ResourceRenderer resource={group} loading={<LoadingGroupsName />}>
        {group => <GroupsName {...group} noLink={noLink} />}
      </ResourceRenderer>
    );
  }
}

GroupsNameContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  noLink: PropTypes.bool
};

export default connect(
  (state, { groupId }) => ({
    group: groupSelector(groupId)(state)
  }),
  (dispatch, { groupId }) => ({
    loadGroupIfNeeded: () => dispatch(fetchGroupIfNeeded(groupId))
  })
)(GroupsNameContainer);
