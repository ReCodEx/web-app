import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { groupSelector } from '../../redux/selectors/groups';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import HierarchyLine from '../../components/Groups/HierarchyLine';

class HierarchyLineContainer extends Component {
  componentDidMount() {
    this.props.loadGroupIfNeeded(this.props.groupId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.groupId !== prevProps.groupId) {
      this.props.loadGroupIfNeeded(this.props.groupId);
    }
  }

  render() {
    const { group } = this.props;
    return (
      <ResourceRenderer resource={group}>
        {group => <HierarchyLine groupId={group.id} parentGroupsIds={group.parentGroupsIds} />}
      </ResourceRenderer>
    );
  }
}

HierarchyLineContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  group: ImmutablePropTypes.map,
  loadGroupIfNeeded: PropTypes.func.isRequired,
};

export default connect(
  (state, { groupId }) => ({
    group: groupSelector(state, groupId),
  }),
  dispatch => ({
    loadGroupIfNeeded: groupId => dispatch(fetchGroupIfNeeded(groupId)),
  })
)(HierarchyLineContainer);
