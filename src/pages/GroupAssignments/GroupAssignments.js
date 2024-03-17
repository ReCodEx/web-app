import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import Button from '../../components/widgets/TheButton';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';

import Page from '../../components/layout/Page';
import { GroupNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import { LoadingGroupData, FailedGroupLoading } from '../../components/Groups/helpers';
import { AssignmentsIcon, AddIcon, BanIcon } from '../../components/icons';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import ShadowAssignmentsTable from '../../components/Assignments/ShadowAssignment/ShadowAssignmentsTable';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning/GroupArchivedWarning';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import LeaveJoinGroupButtonContainer from '../../containers/LeaveJoinGroupButtonContainer';
import ExercisesListContainer from '../../containers/ExercisesListContainer';

import { fetchGroupIfNeeded } from '../../redux/modules/groups';
import { fetchGroupStats } from '../../redux/modules/stats';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { fetchShadowAssignmentsForGroup, createShadowAssignment } from '../../redux/modules/shadowAssignments';
import { create as createExercise } from '../../redux/modules/exercises';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { getLoggedInUserEffectiveRole } from '../../redux/selectors/users';
import {
  groupSelector,
  groupDataAccessorSelector,
  groupsAssignmentsSelector,
  groupsShadowAssignmentsSelector,
} from '../../redux/selectors/groups';
import {
  studentsOfGroupSelector,
  loggedUserIsStudentOfSelector,
  loggedUserIsSupervisorOfSelector,
  loggedUserIsAdminOfSelector,
} from '../../redux/selectors/usersGroups';
import { getStatusesForLoggedUser, createGroupsStatsSelector } from '../../redux/selectors/stats';
import { assignmentEnvironmentsSelector } from '../../redux/selectors/assignments';
import { isReady } from '../../redux/helpers/resourceManager/index';

import { isSuperadminRole } from '../../components/helpers/usersRoles';
import { EMPTY_LIST, hasPermissions, hasOneOfPermissions } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';
import { withRouterProps } from '../../helpers/withRouter';
import { suspendAbortPendingRequestsOptimization } from '../../pages/routes';

class GroupAssignments extends Component {
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

  createShadowAssignment = () => {
    const {
      createShadowAssignment,
      navigate,
      links: { SHADOW_ASSIGNMENT_EDIT_URI_FACTORY },
    } = this.props;
    createShadowAssignment().then(({ value: shadowAssignment }) => {
      suspendAbortPendingRequestsOptimization();
      navigate(SHADOW_ASSIGNMENT_EDIT_URI_FACTORY(shadowAssignment.id));
    });
  };

  createGroupExercise = () => {
    const {
      createGroupExercise,
      navigate,
      links: { EXERCISE_EDIT_URI_FACTORY },
    } = this.props;
    createGroupExercise().then(({ value: exercise }) => {
      suspendAbortPendingRequestsOptimization();
      navigate(EXERCISE_EDIT_URI_FACTORY(exercise.id));
    });
  };

  render() {
    const {
      group,
      groupsAccessor,
      students,
      effectiveRole,
      assignments = EMPTY_LIST,
      shadowAssignments = EMPTY_LIST,
      assignmentEnvironmentsSelector,
      stats,
      statuses,
      isGroupAdmin,
      isGroupSupervisor,
      isGroupStudent,
      userId,
      links: { GROUP_ASSIGNMENTS_URI_FACTORY },
    } = this.props;

    return (
      <Page
        resource={group}
        icon={<AssignmentsIcon />}
        title={<FormattedMessage id="app.groupDetail.title" defaultMessage="Group Assignments" />}
        loading={<LoadingGroupData />}
        failed={<FailedGroupLoading />}>
        {data => {
          const canLeaveGroup =
            !isGroupAdmin &&
            !isGroupSupervisor &&
            (data.public || (isGroupStudent && !data.privateData.detaining)) &&
            !data.organizational;

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
              <GroupNavigation group={data} emails={studentEmails || null} />

              {canLeaveGroup && (
                <div className="my-3">
                  <LeaveJoinGroupButtonContainer userId={userId} groupId={data.id} size={null} redirectAfterLeave />
                </div>
              )}

              {!hasOneOfPermissions(data, 'viewAssignments', 'assignExercise') && (
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
                linkFactory={GROUP_ASSIGNMENTS_URI_FACTORY}
              />

              {!data.organizational && hasPermissions(data, 'viewAssignments') && (
                <>
                  <Row>
                    <Col lg={12}>
                      <Box
                        title={<FormattedMessage id="app.groupDetail.assignments" defaultMessage="Assignments" />}
                        noPadding
                        unlimitedHeight>
                        <ResourceRenderer resource={stats} bulkyLoading>
                          {groupStats => (
                            <AssignmentsTable
                              assignments={assignments}
                              assignmentEnvironmentsSelector={assignmentEnvironmentsSelector}
                              statuses={statuses}
                              stats={groupStats.find(item => item.userId === userId)}
                              userId={isGroupAdmin || isGroupSupervisor ? null : userId}
                              isAdmin={isGroupAdmin || isGroupSupervisor || isSuperadminRole(effectiveRole)}
                            />
                          )}
                        </ResourceRenderer>
                      </Box>
                    </Col>
                  </Row>

                  {(!isGroupStudent || (shadowAssignments && shadowAssignments.size > 0)) && (
                    <Row>
                      <Col lg={12}>
                        <Box
                          title={
                            <FormattedMessage
                              id="app.groupDetail.shadowAssignments"
                              defaultMessage="Shadow Assignments"
                            />
                          }
                          noPadding
                          unlimitedHeight
                          collapsable
                          isOpen={shadowAssignments && shadowAssignments.size > 0}
                          footer={
                            hasPermissions(data, 'createShadowAssignment') ? (
                              <div className="text-center">
                                <Button onClick={this.createShadowAssignment} variant="success">
                                  <AddIcon gapRight />
                                  <FormattedMessage
                                    id="app.groupDetail.newShadowAssignment"
                                    defaultMessage="New Shadow Assignment"
                                  />
                                </Button>
                              </div>
                            ) : null
                          }>
                          <ShadowAssignmentsTable
                            shadowAssignments={shadowAssignments}
                            isAdmin={isGroupAdmin || isGroupSupervisor || isSuperadminRole(effectiveRole)}
                            userId={userId}
                          />
                        </Box>
                      </Col>
                    </Row>
                  )}
                </>
              )}

              {hasPermissions(data, 'assignExercise') && (
                <Row>
                  <Col lg={12}>
                    <Box
                      title={
                        <FormattedMessage
                          id="app.groupAssignments.groupExercises"
                          defaultMessage="Exercises for Assignment in the Group"
                        />
                      }
                      footer={
                        hasPermissions(data, 'createExercise') && !data.archived ? (
                          <div className="text-center">
                            <Button variant="success" onClick={this.createGroupExercise}>
                              <AddIcon gapRight />
                              <FormattedMessage
                                id="app.group.createExercise"
                                defaultMessage="Create Exercise in Group"
                              />
                            </Button>
                          </div>
                        ) : undefined
                      }
                      isOpen
                      unlimitedHeight>
                      <ExercisesListContainer
                        key={data.id /* this will force component reload if group is switched */}
                        id={`exercises-group-${data.id}`}
                        rootGroup={data.id}
                        showAssignButton={
                          !data.organizational && !data.archived && hasPermissions(data, 'assignExercise')
                        }
                      />
                    </Box>
                  </Col>
                </Row>
              )}
            </div>
          );
        }}
      </Page>
    );
  }
}

GroupAssignments.propTypes = {
  params: PropTypes.shape({ groupId: PropTypes.string.isRequired }).isRequired,
  userId: PropTypes.string.isRequired,
  effectiveRole: PropTypes.string,
  group: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  instance: ImmutablePropTypes.map,
  students: PropTypes.array,
  assignments: ImmutablePropTypes.list,
  shadowAssignments: ImmutablePropTypes.list,
  assignmentEnvironmentsSelector: PropTypes.func,
  isGroupAdmin: PropTypes.bool,
  isGroupSupervisor: PropTypes.bool,
  isGroupStudent: PropTypes.bool,
  runtimeEnvironments: ImmutablePropTypes.map,
  loadAsync: PropTypes.func,
  stats: PropTypes.object,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  createShadowAssignment: PropTypes.func.isRequired,
  createGroupExercise: PropTypes.func.isRequired,
  links: PropTypes.object,
  navigate: withRouterProps.navigate,
};

const mapStateToProps = (state, { params: { groupId } }) => {
  const userId = loggedInUserIdSelector(state);

  return {
    group: groupSelector(state, groupId),
    groupsAccessor: groupDataAccessorSelector(state),
    userId,
    effectiveRole: getLoggedInUserEffectiveRole(state),
    assignments: groupsAssignmentsSelector(state, groupId),
    shadowAssignments: groupsShadowAssignmentsSelector(state, groupId),
    assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
    statuses: getStatusesForLoggedUser(state, groupId),
    stats: createGroupsStatsSelector(groupId)(state),
    students: studentsOfGroupSelector(state, groupId),
    isGroupSupervisor: loggedUserIsSupervisorOfSelector(state)(groupId),
    isGroupAdmin: loggedUserIsAdminOfSelector(state)(groupId),
    isGroupStudent: loggedUserIsStudentOfSelector(state)(groupId),
  };
};

const mapDispatchToProps = (dispatch, { params }) => ({
  loadAsync: () => GroupAssignments.loadAsync(params, dispatch),
  createShadowAssignment: () => dispatch(createShadowAssignment(params.groupId)),
  createGroupExercise: () => dispatch(createExercise({ groupId: params.groupId })),
});

export default withLinks(connect(mapStateToProps, mapDispatchToProps)(GroupAssignments));
