import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import ShadowAssignmentsTable from '../../components/Assignments/ShadowAssignment/ShadowAssignmentsTable';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { LoadingIcon } from '../../components/icons';

import { fetchShadowAssignmentsForGroup } from '../../redux/modules/shadowAssignments';
import { groupsShadowAssignmentsSelector } from '../../redux/selectors/groups';
import { loggedUserIsSupervisorOfSelector, loggedUserIsAdminOfSelector } from '../../redux/selectors/usersGroups';

class ShadowAssignmentsTableContainer extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.groupId !== prevProps.groupId || this.props.userId !== prevProps.userId) {
      this.props.loadAsync();
    }
  }

  render() {
    const { userId, shadowAssignments, isGroupAdmin, isGroupSupervisor, hideEmpty = false } = this.props;
    return hideEmpty && shadowAssignments.size === 0 ? null : (
      <ResourceRenderer
        resource={shadowAssignments}
        loading={
          <div className="text-center p-2">
            <LoadingIcon gapRight />
            <FormattedMessage id="generic.loading" defaultMessage="Loading..." />
          </div>
        }>
        {() => (
          <ShadowAssignmentsTable
            shadowAssignments={shadowAssignments}
            isAdmin={isGroupAdmin || isGroupSupervisor}
            userId={userId}
          />
        )}
      </ResourceRenderer>
    );
  }
}

ShadowAssignmentsTableContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  hideEmpty: PropTypes.bool,
  shadowAssignments: ImmutablePropTypes.list,
  isGroupAdmin: PropTypes.bool,
  isGroupSupervisor: PropTypes.bool,
  loadAsync: PropTypes.func.isRequired,
};

export default connect(
  (state, { groupId }) => ({
    shadowAssignments: groupsShadowAssignmentsSelector(state, groupId),
    isGroupSupervisor: loggedUserIsSupervisorOfSelector(state)(groupId),
    isGroupAdmin: loggedUserIsAdminOfSelector(state)(groupId),
  }),
  (dispatch, { groupId, userId = null }) => ({
    loadAsync: () => dispatch(fetchShadowAssignmentsForGroup(groupId)),
  })
)(ShadowAssignmentsTableContainer);
