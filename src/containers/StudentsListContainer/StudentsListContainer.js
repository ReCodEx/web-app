import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import StudentsList from '../../components/Users/StudentsList';

import { readyUsersDataSelector } from '../../redux/selectors/users';
import { groupSelector } from '../../redux/selectors/groups';
import { studentsIdsOfGroup } from '../../redux/selectors/usersGroups';
import { createGroupsStatsSelector } from '../../redux/selectors/stats';
import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchByIds } from '../../redux/modules/users';
import { fetchGroupStatsIfNeeded } from '../../redux/modules/stats';

import { safeGet } from '../../helpers/common';

class StudentsListContainer extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (prevProps.groupId !== this.props.groupId) {
      this.props.loadAsync();
    }
  }

  render() {
    const { groupId, group, students, stats, ...props } = this.props;
    return (
      <ResourceRenderer resource={group}>
        {group => (
          <StudentsList
            {...props}
            users={students}
            isLoaded={students.length === group.privateData.students.length}
            stats={stats}
            groupId={groupId}
          />
        )}
      </ResourceRenderer>
    );
  }
}

StudentsListContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  group: PropTypes.object.isRequired,
  students: PropTypes.array,
  stats: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
};

export default connect(
  (state, { groupId }) => {
    const group = groupSelector(state, groupId);
    const studentsIds = studentsIdsOfGroup(groupId)(state);
    const readyUsers = readyUsersDataSelector(state);
    const students = readyUsers.filter(user => studentsIds.includes(user.id));

    return {
      group,
      students,
      stats: createGroupsStatsSelector(groupId)(state),
    };
  },
  (dispatch, { groupId }) => ({
    loadAsync: () =>
      Promise.all([
        dispatch(fetchGroupStatsIfNeeded(groupId)),
        dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) =>
          dispatch(fetchByIds(safeGet(group, ['privateData', 'students'], [])))
        ),
      ]),
  })
)(StudentsListContainer);
