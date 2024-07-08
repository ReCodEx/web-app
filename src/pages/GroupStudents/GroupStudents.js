import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Page from '../../components/layout/Page';
import { GroupNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import { LoadingGroupData, FailedGroupLoading } from '../../components/Groups/helpers';
import { StudentsIcon, BanIcon } from '../../components/icons';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import AddStudent from '../../components/Groups/AddStudent';
import GroupExamPending from '../../components/Groups/GroupExamPending';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import GroupInvitationsContainer from '../../containers/GroupInvitationsContainer';

import { fetchGroupIfNeeded } from '../../redux/modules/groups.js';
import { fetchGroupStats, fetchGroupStatsIfNeeded } from '../../redux/modules/stats.js';
import { fetchByIds, inviteUser } from '../../redux/modules/users.js';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments.js';
import {
  fetchShadowAssignmentsForGroup,
  setShadowAssignmentPoints,
  removeShadowAssignmentPoints,
} from '../../redux/modules/shadowAssignments.js';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments.js';
import { fetchUsersSolutions } from '../../redux/modules/solutions.js';

import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import { loggedInUserSelector, getLoggedInUserEffectiveRole } from '../../redux/selectors/users.js';
import {
  groupSelector,
  groupDataAccessorSelector,
  groupsAssignmentsSelector,
  groupsShadowAssignmentsSelector,
} from '../../redux/selectors/groups.js';
import {
  studentsOfGroupSelector,
  loggedUserIsStudentOfSelector,
  loggedUserIsSupervisorOfSelector,
  loggedUserIsAdminOfSelector,
  loggedUserCanInviteToGroupsSelector,
} from '../../redux/selectors/usersGroups.js';
import { createGroupsStatsSelector } from '../../redux/selectors/stats.js';
import { getUserSolutionsSortedData } from '../../redux/selectors/assignments.js';
import { fetchManyUserSolutionsStatus } from '../../redux/selectors/solutions.js';
import { runtimeEnvironmentsSelector } from '../../redux/selectors/runtimeEnvironments.js';

import withLinks from '../../helpers/withLinks.js';
import { isReady } from '../../redux/helpers/resourceManager/index.js';
import ResultsTable from '../../components/Groups/ResultsTable/ResultsTable.js';

import { isSuperadminRole, isStudentRole } from '../../components/helpers/usersRoles.js';
import { EMPTY_LIST, hasPermissions, safeGet } from '../../helpers/common.js';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning/GroupArchivedWarning.js';

class GroupStudents extends Component {
  static loadAsync = ({ groupId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) =>
        Promise.all([
          hasPermissions(group, 'viewAssignments')
            ? Promise.all([
                dispatch(fetchAssignmentsForGroup(groupId)),
                dispatch(fetchShadowAssignmentsForGroup(groupId)),
              ])
            : Promise.resolve(),
          hasPermissions(group, 'viewStudents')
            ? dispatch(fetchByIds(safeGet(group, ['privateData', 'students']) || []))
            : Promise.resolve(),
          dispatch(fetchGroupStats(groupId)),
        ])
      ),
    ]);

  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.groupId !== prevProps.params.groupId) {
      this.props.loadAsync();
      return;
    }

    if (
      isReady(this.props.group) &&
      isReady(prevProps.group) &&
      this.props.group.hasIn(['data', 'privateData', 'students']) &&
      prevProps.group.hasIn(['data', 'privateData', 'students'])
    ) {
      const prevData = prevProps.group.toJS().data.privateData;
      const newData = this.props.group.toJS().data.privateData;
      if (prevData.students.length !== newData.students.length) {
        this.props.loadAsync();
      }
    }
  }

  render() {
    const {
      group,
      groupsAccessor,
      invitableGroups,
      students,
      loggedUser,
      effectiveRole,
      assignments = EMPTY_LIST,
      shadowAssignments = EMPTY_LIST,
      stats,
      isGroupAdmin,
      isGroupSupervisor,
      isGroupStudent,
      userId,
      userSolutionsSelector,
      userSolutionsStatusSelector,
      runtimeEnvironments,
      fetchGroupStatsIfNeeded,
      fetchUsersSolutions,
      setShadowPoints,
      removeShadowPoints,
      inviteUser,
      links: { GROUP_STUDENTS_URI_FACTORY },
    } = this.props;

    return (
      <Page
        resource={[group, loggedUser]}
        icon={<StudentsIcon />}
        title={<FormattedMessage id="app.groupStudents.title" defaultMessage="Group Students" />}
        loading={<LoadingGroupData />}
        failed={<FailedGroupLoading />}>
        {(data, loggedUser) => {
          const canLeaveGroup =
            !isGroupAdmin &&
            !isGroupSupervisor &&
            !data.organizational &&
            !data.archived &&
            (data.public || (isGroupStudent && !data.privateData.detaining));

          const studentEmails =
            !data.organizational &&
            hasPermissions(data, 'viewStudents', 'sendEmail') &&
            students &&
            students
              .map(s => s.privateData && s.privateData.email)
              .filter(s => s)
              .map(encodeURIComponent)
              .join(',');

          return (
            <div>
              {data.privateData && <GroupNavigation group={data} emails={studentEmails || null} />}

              {canLeaveGroup && (
                <div className="my-3">
                  <LeaveJoinGroupButtonContainer userId={userId} groupId={data.id} size={null} redirectAfterLeave />
                </div>
              )}

              {!hasPermissions(data, 'viewAssignments') && (
                <Row>
                  <Col sm={12}>
                    <Callout variant="warning" className="larger" icon={<BanIcon />}>
                      <FormattedMessage
                        id="generic.accessDenied"
                        defaultMessage="You do not have permissions to see this page. If you got to this page via a seemingly legitimate link or button, please report a bug."
                      />
                    </Callout>
                  </Col>
                </Row>
              )}

              {data.privateData && <GroupExamPending {...data} currentUser={loggedUser} />}

              {data.organizational && (
                <Row>
                  <Col lg={12}>
                    <Callout variant="info">
                      <FormattedMessage
                        id="app.group.organizationalExplain"
                        defaultMessage="This group is organizational, so it cannot have any students nor assignments. However, it may have attached exercises which can be assigned in sub-groups."
                      />
                    </Callout>
                  </Col>
                </Row>
              )}

              <GroupArchivedWarning
                {...data}
                groupsDataAccessor={groupsAccessor}
                linkFactory={isGroupStudent ? null : GROUP_STUDENTS_URI_FACTORY}
              />

              {isStudentRole(effectiveRole) &&
                isGroupStudent &&
                !safeGet(data, ['privateData', 'publicStats'], false) && (
                  <Callout variant="info">
                    <FormattedMessage
                      id="app.groupStudents.privateStats"
                      defaultMessage="The admin of the group has restricted the access to the results of students. Therefore, you can see only your own results, not the results of other students."
                    />
                  </Callout>
                )}

              {!data.organizational && hasPermissions(data, 'viewAssignments', 'viewStudents') && (
                <Row>
                  <Col lg={12}>
                    <Box
                      title={
                        <FormattedMessage
                          id="app.groupStudents.studentsResultsTable"
                          defaultMessage="Students and Their Results"
                        />
                      }
                      unlimitedHeight
                      noPadding>
                      <ResourceRenderer resource={stats} bulkyLoading>
                        {groupStats => (
                          <ResourceRenderer resource={assignments} returnAsArray bulkyLoading>
                            {assignments => (
                              <ResourceRenderer resource={shadowAssignments} returnAsArray bulkyLoading>
                                {shadowAssignments => (
                                  <ResourceRenderer resourceArray={runtimeEnvironments} bulkyLoading>
                                    {runtimes => (
                                      <ResultsTable
                                        users={students}
                                        loggedUser={loggedUser}
                                        isSuperadmin={isSuperadminRole(effectiveRole)}
                                        assignments={assignments}
                                        shadowAssignments={shadowAssignments}
                                        stats={groupStats}
                                        group={data}
                                        runtimeEnvironments={runtimes}
                                        userSolutionsSelector={userSolutionsSelector}
                                        userSolutionsStatusSelector={userSolutionsStatusSelector}
                                        fetchGroupStatsIfNeeded={fetchGroupStatsIfNeeded}
                                        fetchUsersSolutions={fetchUsersSolutions}
                                        setShadowPoints={setShadowPoints}
                                        removeShadowPoints={removeShadowPoints}
                                        renderActions={id =>
                                          data.archived ? null : (
                                            <LeaveJoinGroupButtonContainer userId={id} groupId={data.id} />
                                          )
                                        }
                                      />
                                    )}
                                  </ResourceRenderer>
                                )}
                              </ResourceRenderer>
                            )}
                          </ResourceRenderer>
                        )}
                      </ResourceRenderer>
                    </Box>
                  </Col>
                </Row>
              )}

              {
                // unfortunatelly, this cannot be covered by permission hints at the moment, since addStudent involes both student and group
                !data.organizational &&
                  !data.archived &&
                  (hasPermissions(data, 'inviteStudents') || hasPermissions(data, 'editInvitations')) && (
                    <Row>
                      {hasPermissions(data, 'inviteStudents') && (
                        <Col xl={6}>
                          <Box
                            title={<FormattedMessage id="app.groupStudents.addStudent" defaultMessage="Add Student" />}
                            isOpen>
                            <AddStudent
                              instanceId={data.privateData.instanceId}
                              groups={invitableGroups}
                              groupsAccessor={groupsAccessor}
                              groupId={data.id}
                              canSearch={
                                isSuperadminRole(effectiveRole) ||
                                ((isGroupSupervisor || isGroupAdmin) && !isStudentRole(effectiveRole))
                              }
                              inviteUser={inviteUser}
                            />
                          </Box>
                        </Col>
                      )}

                      <Col xl={6}>
                        <Box
                          title={<FormattedMessage id="app.groupStudents.invitations" defaultMessage="Invitations" />}
                          isOpen>
                          <GroupInvitationsContainer
                            groupId={data.id}
                            actionButtons={hasPermissions(data, 'editInvitations')}
                          />
                        </Box>
                      </Col>
                    </Row>
                  )
              }
            </div>
          );
        }}
      </Page>
    );
  }
}

GroupStudents.propTypes = {
  params: PropTypes.shape({ groupId: PropTypes.string.isRequired }).isRequired,
  userId: PropTypes.string.isRequired,
  loggedUser: ImmutablePropTypes.map,
  effectiveRole: PropTypes.string,
  group: ImmutablePropTypes.map,
  currentUser: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  invitableGroups: ImmutablePropTypes.map,
  instance: ImmutablePropTypes.map,
  students: PropTypes.array,
  assignments: ImmutablePropTypes.list,
  shadowAssignments: ImmutablePropTypes.list,
  isGroupAdmin: PropTypes.bool,
  isGroupSupervisor: PropTypes.bool,
  isGroupStudent: PropTypes.bool,
  userSolutionsSelector: PropTypes.func.isRequired,
  userSolutionsStatusSelector: PropTypes.func.isRequired,
  runtimeEnvironments: ImmutablePropTypes.map,
  loadAsync: PropTypes.func,
  stats: PropTypes.object,
  fetchGroupStatsIfNeeded: PropTypes.func.isRequired,
  fetchUsersSolutions: PropTypes.func.isRequired,
  setShadowPoints: PropTypes.func.isRequired,
  removeShadowPoints: PropTypes.func.isRequired,
  inviteUser: PropTypes.func.isRequired,
  links: PropTypes.object,
};

const mapStateToProps = (state, { params: { groupId } }) => {
  const userId = loggedInUserIdSelector(state);

  return {
    group: groupSelector(state, groupId),
    groupsAccessor: groupDataAccessorSelector(state),
    invitableGroups: loggedUserCanInviteToGroupsSelector(state),
    userId,
    loggedUser: loggedInUserSelector(state),
    effectiveRole: getLoggedInUserEffectiveRole(state),
    assignments: groupsAssignmentsSelector(state, groupId),
    shadowAssignments: groupsShadowAssignmentsSelector(state, groupId),
    stats: createGroupsStatsSelector(groupId)(state),
    students: studentsOfGroupSelector(state, groupId),
    isGroupSupervisor: loggedUserIsSupervisorOfSelector(state)(groupId),
    isGroupAdmin: loggedUserIsAdminOfSelector(state)(groupId),
    isGroupStudent: loggedUserIsStudentOfSelector(state)(groupId),
    userSolutionsSelector: getUserSolutionsSortedData(state),
    userSolutionsStatusSelector: fetchManyUserSolutionsStatus(state),
    runtimeEnvironments: runtimeEnvironmentsSelector(state),
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  loadAsync: () => GroupStudents.loadAsync(params, dispatch),
  fetchGroupStatsIfNeeded: () => dispatch(fetchGroupStatsIfNeeded(params.groupId, { allowReload: true })),
  fetchUsersSolutions: (userId, assignmentId) => dispatch(fetchUsersSolutions(userId, assignmentId)),
  setShadowPoints: (shadowId, { awardeeId, pointsId, points, note, awardedAt }) =>
    dispatch(setShadowAssignmentPoints(params.groupId, shadowId, awardeeId, pointsId, points, note, awardedAt)),
  removeShadowPoints: (shadowId, awardeeId, pointsId) =>
    dispatch(removeShadowAssignmentPoints(params.groupId, shadowId, awardeeId, pointsId)),
  inviteUser: data => dispatch(inviteUser(data)),
});

export default withLinks(connect(mapStateToProps, mapDispatchToProps)(GroupStudents));
