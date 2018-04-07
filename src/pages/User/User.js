import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { Set } from 'immutable';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import { LoadingInfoBox } from '../../components/widgets/InfoBox';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersNameContainer from '../../containers/UsersNameContainer';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import UsersStats from '../../components/Users/UsersStats';
import GroupsName from '../../components/Groups/GroupsName';

import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchInstanceGroups } from '../../redux/modules/groups';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import {
  getUser,
  studentOfGroupsIdsSelector,
  isStudent,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { createGroupsStatsSelector } from '../../redux/selectors/stats';
import {
  groupsPublicAssignmentsSelector,
  studentOfSelector2,
  supervisorOfSelector2,
  adminOfSelector
} from '../../redux/selectors/groups';
import { assignmentEnvironmentsSelector } from '../../redux/selectors/assignments';

import { InfoIcon } from '../../components/icons';
import { getJsData } from '../../redux/helpers/resourceManager';
import withLinks from '../../helpers/withLinks';

class User extends Component {
  componentWillMount = () =>
    this.props.loadAsync(this.props.loggedInUserId, this.props.isAdmin);
  componentWillReceiveProps = newProps => {
    if (
      this.props.params.userId !== newProps.params.userId ||
      this.props.commonGroups.length > newProps.commonGroups.length ||
      this.props.loggedInUserId !== newProps.loggedInUserId ||
      this.props.isAdmin !== newProps.isAdmin
    ) {
      newProps.loadAsync(newProps.loggedInUserId, newProps.isAdmin);
    }
  };

  /**
   * A fairly complicated load method - uses redux thunk
   * to load the groups and necessary data for the intersection
   * of user's groups of which the current user is a supervisor.
   */
  static loadAsync = ({ userId }, dispatch, loggedInUserId, isAdmin) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      dispatch((dispatch, getState) =>
        dispatch(fetchUserIfNeeded(userId))
          .then(() => dispatch(fetchUserIfNeeded(loggedInUserId)))
          .then(() => {
            const state = getState();
            const instanceId = getJsData(getUser(loggedInUserId)(state))
              .privateData.instanceId;

            return dispatch(fetchInstanceGroups(instanceId)).then(groups =>
              Promise.all(
                groups.value.map(group => {
                  if (
                    group.privateData &&
                    group.privateData.students.indexOf(userId) >= 0 &&
                    (isAdmin ||
                      userId === loggedInUserId ||
                      group.privateData.supervisors.indexOf(loggedInUserId) >=
                        0 ||
                      group.privateData.admins.indexOf(loggedInUserId) >= 0)
                  ) {
                    return Promise.all([
                      dispatch(fetchAssignmentsForGroup(group.id)),
                      dispatch(fetchGroupsStatsIfNeeded(group.id))
                    ]);
                  } else {
                    return Promise.resolve();
                  }
                })
              )
            );
          })
      )
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
      links: {
        GROUP_DETAIL_URI_FACTORY,
        INSTANCE_URI_FACTORY,
        EDIT_USER_URI_FACTORY
      }
    } = this.props;

    return (
      <Page
        resource={user}
        title={
          <FormattedMessage
            id="app.user.title"
            defaultMessage="User's profile"
          />
        }
        description={
          <FormattedMessage
            id="app.user.description"
            defaultMessage="All of the user's progress in all groups."
          />
        }
        breadcrumbs={[
          {
            iconName: 'user',
            text: (
              <FormattedMessage
                id="app.editUser.title"
                defaultMessage="Edit user's profile"
              />
            ),
            link: EDIT_USER_URI_FACTORY(userId)
          },
          {
            text: (
              <FormattedMessage
                id="app.user.title"
                defaultMessage="User's profile"
              />
            ),
            iconName: 'user'
          }
        ]}
      >
        {user =>
          <div>
            <p>
              <UsersNameContainer userId={user.id} large noLink />
            </p>

            {(commonGroups.length > 0 || isAdmin) &&
              <div>
                {commonGroups.map(group =>
                  <div key={group.id}>
                    <ResourceRenderer
                      loading={
                        <Row>
                          <Col lg={4}>
                            <LoadingInfoBox
                              title={<GroupsName {...group} noLink />}
                            />
                          </Col>
                        </Row>
                      }
                      resource={groupStatistics(group.id)}
                    >
                      {statistics =>
                        <Row>
                          <Col lg={4}>
                            <Link to={GROUP_DETAIL_URI_FACTORY(group.id)}>
                              <UsersStats
                                {...group}
                                stats={usersStatistics(statistics)}
                              />
                            </Link>
                          </Col>
                          <Col lg={8}>
                            <Box
                              title={<GroupsName {...group} noLink />}
                              collapsable
                              noPadding
                              isOpen
                              unlimitedHeight
                              footer={
                                <p className="text-center">
                                  <LinkContainer
                                    to={GROUP_DETAIL_URI_FACTORY(group.id)}
                                  >
                                    <Button bsSize="sm">
                                      <FormattedMessage
                                        id="app.group.detailButton"
                                        defaultMessage="Group Detail"
                                      />
                                    </Button>
                                  </LinkContainer>
                                </p>
                              }
                            >
                              <AssignmentsTable
                                userId={user.id}
                                assignments={groupAssignments(group.id)}
                                assignmentEnvironmentsSelector={
                                  assignmentEnvironmentsSelector
                                }
                                showGroup={false}
                                statuses={
                                  usersStatistics(statistics).assignments
                                }
                              />
                            </Box>
                          </Col>
                        </Row>}
                    </ResourceRenderer>
                  </div>
                )}
              </div>}

            {commonGroups.length === 0 &&
              !isAdmin &&
              user.id !== loggedInUserId &&
              <div className="callout callout-warning">
                <h4>
                  <InfoIcon />{' '}
                  <FormattedMessage
                    id="app.user.nothingInCommon.title"
                    defaultMessage="You are not a supervisor of {name}"
                    values={{ name: user.fullName }}
                  />
                </h4>
                <FormattedMessage
                  id="app.user.noCommonGroups"
                  defaultMessage="You are not a supervisor of any group of which is {name} a member and so you don't see any of his results."
                  values={{ name: user.fullName }}
                />
              </div>}

            {student &&
              studentOfGroupsIds.length === 0 &&
              user.id === loggedInUserId &&
              <Row>
                <Col sm={12}>
                  <div className="callout callout-success">
                    <h4>
                      <InfoIcon />{' '}
                      <FormattedMessage
                        id="app.user.welcomeTitle"
                        defaultMessage="Welcome to ReCodEx"
                      />
                    </h4>
                    <p>
                      <FormattedMessage
                        id="app.user.newAccount"
                        defaultMessage="Your account is ready, but you are not a member of any group yet. You should see the list of all the available groups and join some of them."
                        values={{ name: user.fullName }}
                      />
                    </p>
                    <p className="text-center">
                      <LinkContainer to={INSTANCE_URI_FACTORY(user.instanceId)}>
                        <Button bsStyle="success">
                          <FormattedMessage
                            id="app.user.examineGroupsInstance"
                            defaultMessage="Find your groups"
                          />
                        </Button>
                      </LinkContainer>
                    </p>
                  </div>
                </Col>
              </Row>}
          </div>}
      </Page>
    );
  }
}

User.propTypes = {
  userId: PropTypes.string,
  user: ImmutablePropTypes.map,
  commonGroups: PropTypes.array,
  isAdmin: PropTypes.bool,
  studentOfGroupsIds: PropTypes.array,
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  student: PropTypes.bool,
  loggedInUserId: PropTypes.string,
  groupAssignments: PropTypes.func.isRequired,
  assignmentEnvironmentsSelector: PropTypes.func,
  groupStatistics: PropTypes.func.isRequired,
  usersStatistics: PropTypes.func.isRequired,
  links: PropTypes.object
};

export default withLinks(
  connect(
    (state, { params: { userId } }) => {
      const loggedInUserId = loggedInUserIdSelector(state);
      const isSuperadmin = isLoggedAsSuperAdmin(state);

      const studentOfArray = studentOfSelector2(userId)(state)
        .toList()
        .toArray();
      const studentOf = new Set(
        studentOfSelector2(userId)(state).toList().toJS().map(group => group.id)
      );
      const supervisorOf = new Set(
        supervisorOfSelector2(loggedInUserId)(state)
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

      const otherUserGroupsIds = studentOf
        .intersect(supervisorOf.union(adminOf))
        .toArray();
      const commonGroups =
        userId === loggedInUserId || isSuperadmin
          ? studentOfArray
          : studentOfArray.filter(
              group => otherUserGroupsIds.indexOf(group.id) >= 0
            );

      return {
        userId,
        loggedInUserId,
        student: isStudent(userId)(state),
        user: getUser(userId)(state),
        isAdmin: isSuperadmin,
        studentOfGroupsIds: studentOfGroupsIdsSelector(userId)(state).toArray(),
        groupAssignments: groupId =>
          groupsPublicAssignmentsSelector(state, groupId),
        assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
        groupStatistics: groupId => createGroupsStatsSelector(groupId)(state),
        usersStatistics: statistics =>
          statistics.find(stat => stat.userId === userId) || {},
        commonGroups
      };
    },
    (dispatch, { params }) => ({
      loadAsync: (loggedInUserId, isAdmin) =>
        User.loadAsync(params, dispatch, loggedInUserId, isAdmin)
    })
  )(User)
);
