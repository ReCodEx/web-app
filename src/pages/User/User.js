import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Set } from 'immutable';

import Page from '../../components/layout/Page';
import { UserNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Callout from '../../components/widgets/Callout';
import { LoadingInfoBox } from '../../components/widgets/InfoBox';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import UsersStats from '../../components/Users/UsersStats';
import GroupsName from '../../components/Groups/GroupsName';

import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchAllGroups } from '../../redux/modules/groups';
import { fetchGroupStatsIfNeeded } from '../../redux/modules/stats';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { takeOver } from '../../redux/modules/auth';

import { getUser, isStudent, isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { loggedInUserIdSelector, selectedInstanceId } from '../../redux/selectors/auth';
import { createGroupsStatsSelector } from '../../redux/selectors/stats';
import { groupSelector, groupsAssignmentsSelector } from '../../redux/selectors/groups';
import {
  userStudentOfGroupIdsSelector,
  studentOfSelector,
  supervisorOfSelector,
  adminOfSelector,
} from '../../redux/selectors/usersGroups';
import { assignmentEnvironmentsSelector } from '../../redux/selectors/assignments';

import { InfoIcon, TransferIcon, AssignmentsIcon, GroupIcon } from '../../components/icons';
import { safeGet } from '../../helpers/common';
import withLinks from '../../helpers/withLinks';

class User extends Component {
  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (
      this.props.match.params.userId !== prevProps.match.params.userId ||
      this.props.loggedInUserId !== prevProps.loggedInUserId
    ) {
      this.props.loadAsync();
    }
  }

  static customLoadGroups = true; // Marker for the App async load, that we will load groups ourselves.

  /**
   * A fairly complicated load method - uses redux thunk
   * to load the groups and necessary data for the intersection
   * of user's groups of which the current user is a supervisor.
   */
  static loadAsync = ({ userId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchAllGroups()).then(() =>
        dispatch(fetchUserIfNeeded(userId)).then(({ value: user }) => {
          const studentOf = safeGet(user, ['privateData', 'groups', 'studentOf'], []);
          const supervisorOf = safeGet(user, ['privateData', 'groups', 'supervisorOf'], []);
          return dispatch((dispatch, getState) =>
            Promise.all(
              [...studentOf, ...supervisorOf]
                .filter(groupId => {
                  // TODO this should be done better using security endpoint (unfortunatelly, permission hints are insuficient)
                  const group = groupSelector(getState(), groupId);
                  return group && group.getIn(['data', 'permissionHints', 'viewAssignments']);
                })
                .map(groupId =>
                  Promise.all([dispatch(fetchAssignmentsForGroup(groupId)), dispatch(fetchGroupStatsIfNeeded(groupId))])
                )
            )
          );
        })
      ),
    ]);

  render() {
    const {
      userId,
      user,
      student,
      isAdmin,
      studentOfGroupsIds,
      commonGroups,
      loggedInUserId,
      groupAssignments,
      assignmentEnvironmentsSelector,
      groupStatistics,
      usersStatistics,
      takeOver,
      links: { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY, INSTANCE_URI_FACTORY },
    } = this.props;

    return (
      <Page
        resource={user}
        title={<FormattedMessage id="app.user.title" defaultMessage="User's profile" />}
        description={
          <FormattedMessage id="app.user.description" defaultMessage="Complete progress of the user in all groups." />
        }
        breadcrumbs={[
          {
            text: <FormattedMessage id="app.user.title" defaultMessage="User's profile" />,
            iconName: 'user',
          },
        ]}>
        {user => (
          <div>
            <UserNavigation userId={userId} canViewDetail canEdit={isAdmin || userId === loggedInUserId} />

            {isAdmin && userId !== loggedInUserId && (
              <div className="mb-3">
                <TheButtonGroup>
                  {user.privateData.isAllowed && (
                    <Button variant="primary" onClick={() => takeOver(userId)}>
                      <TransferIcon gapRight />
                      <FormattedMessage id="app.users.takeOver" defaultMessage="Login as" />
                    </Button>
                  )}

                  <AllowUserButtonContainer id={userId} />
                </TheButtonGroup>
              </div>
            )}

            {(commonGroups.length > 0 || isAdmin) && (
              <div>
                {commonGroups.map(group => (
                  <div key={group.id}>
                    <ResourceRenderer
                      loading={
                        <Row>
                          <Col lg={4}>
                            <LoadingInfoBox title={<GroupsName {...group} translations />} />
                          </Col>
                        </Row>
                      }
                      resource={groupStatistics(group.id)}>
                      {statistics => (
                        <Row>
                          <Col lg={4}>
                            <Link to={GROUP_DETAIL_URI_FACTORY(group.id)}>
                              <UsersStats {...group} stats={usersStatistics(statistics)} />
                            </Link>
                          </Col>
                          <Col lg={8}>
                            <Box
                              title={<GroupsName {...group} translations />}
                              collapsable
                              noPadding
                              isOpen
                              unlimitedHeight
                              footer={
                                <div className="mb-3 text-center">
                                  <TheButtonGroup>
                                    <Link to={GROUP_INFO_URI_FACTORY(group.id)}>
                                      <Button size="sm">
                                        <GroupIcon gapRight />
                                        <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
                                      </Button>
                                    </Link>

                                    <Link to={GROUP_DETAIL_URI_FACTORY(group.id)}>
                                      <Button size="sm">
                                        <AssignmentsIcon gapRight />
                                        <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
                                      </Button>
                                    </Link>
                                  </TheButtonGroup>
                                </div>
                              }>
                              <AssignmentsTable
                                userId={user.id}
                                assignments={groupAssignments(group.id)}
                                assignmentEnvironmentsSelector={assignmentEnvironmentsSelector}
                                statuses={usersStatistics(statistics).assignments}
                              />
                            </Box>
                          </Col>
                        </Row>
                      )}
                    </ResourceRenderer>
                  </div>
                ))}
              </div>
            )}

            {commonGroups.length === 0 && !isAdmin && user.id !== loggedInUserId && (
              <Callout variant="warning" icon={<InfoIcon />}>
                <h4>
                  <FormattedMessage
                    id="app.user.nothingInCommon.title"
                    defaultMessage="{name} is not one of your students"
                    values={{ name: user.fullName }}
                  />
                </h4>
                <FormattedMessage
                  id="app.user.noCommonGroups"
                  defaultMessage="You are not a supervisor of any group of which is {name} a member and so you don't see any of his results."
                  values={{ name: user.fullName }}
                />
              </Callout>
            )}

            {student && studentOfGroupsIds.length === 0 && user.id === loggedInUserId && (
              <Row>
                <Col sm={12}>
                  <Callout variant="success" icon={<InfoIcon />}>
                    <h4>
                      <FormattedMessage id="app.user.welcomeTitle" defaultMessage="Welcome to ReCodEx" />
                    </h4>
                    <p>
                      <FormattedMessage
                        id="app.user.newAccount"
                        defaultMessage="Your account is ready, but you are not a member of any group yet. You should see the list of all the available groups and join some of them."
                        values={{ name: user.fullName }}
                      />
                    </p>
                    <p className="text-center">
                      <Link to={INSTANCE_URI_FACTORY(user.instanceId)}>
                        <Button variant="success">
                          <FormattedMessage id="app.user.examineGroupsInstance" defaultMessage="Find your groups" />
                        </Button>
                      </Link>
                    </p>
                  </Callout>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Page>
    );
  }
}

User.propTypes = {
  userId: PropTypes.string,
  instanceId: PropTypes.string,
  user: ImmutablePropTypes.map,
  commonGroups: PropTypes.array,
  isAdmin: PropTypes.bool,
  studentOfGroupsIds: PropTypes.array,
  match: PropTypes.shape({ params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  student: PropTypes.bool,
  loggedInUserId: PropTypes.string,
  groupAssignments: PropTypes.func.isRequired,
  assignmentEnvironmentsSelector: PropTypes.func,
  groupStatistics: PropTypes.func.isRequired,
  usersStatistics: PropTypes.func.isRequired,
  takeOver: PropTypes.func.isRequired,
  links: PropTypes.object,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { userId },
        },
      }
    ) => {
      const loggedInUserId = loggedInUserIdSelector(state);
      const isSuperadmin = isLoggedAsSuperAdmin(state);

      const studentOfArray = studentOfSelector(userId)(state).toList().toArray();
      const studentOf = new Set(
        studentOfSelector(userId)(state)
          .toList()
          .toJS()
          .map(group => group.id)
      );
      const supervisorOf = new Set(
        supervisorOfSelector(loggedInUserId)(state)
          .toList()
          .toJS()
          .map(group => group.id)
      );
      const adminOf = new Set(
        adminOfSelector(loggedInUserId)(state)
          .toList()
          .toJS()
          .map(group => group.id)
      );

      const otherUserGroupsIds = studentOf.intersect(supervisorOf.union(adminOf)).toArray();
      const commonGroups =
        userId === loggedInUserId || isSuperadmin
          ? studentOfArray
          : studentOfArray.filter(group => otherUserGroupsIds.indexOf(group.id) >= 0);

      return {
        userId,
        loggedInUserId,
        instanceId: selectedInstanceId(state),
        student: isStudent(userId)(state),
        user: getUser(userId)(state),
        isAdmin: isSuperadmin,
        studentOfGroupsIds: userStudentOfGroupIdsSelector(state, userId),
        groupAssignments: groupId => groupsAssignmentsSelector(state, groupId),
        assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
        groupStatistics: groupId => createGroupsStatsSelector(groupId)(state),
        usersStatistics: statistics => statistics.find(stat => stat.userId === userId) || {},
        commonGroups,
      };
    },
    (dispatch, { match: { params } }) => ({
      loadAsync: () => User.loadAsync(params, dispatch),
      takeOver: userId => dispatch(takeOver(userId)),
    })
  )(User)
);
