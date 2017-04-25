import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Button from '../../components/widgets/FlatButton';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import { LoadingInfoBox } from '../../components/widgets/InfoBox';
import ResourceRenderer from '../../components/ResourceRenderer';
import UsersNameContainer from '../../containers/UsersNameContainer';
import StudentsListContainer from '../../containers/StudentsListContainer';
import AssignmentsTable
  from '../../components/Assignments/Assignment/AssignmentsTable';
import UsersStats from '../../components/Users/UsersStats';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchGroupsIfNeeded } from '../../redux/modules/groups';

import {
  getUser,
  studentOfGroupsIdsSelector,
  supervisorOfGroupsIdsSelector,
  isStudent,
  isSupervisor,
  isSuperAdmin
} from '../../redux/selectors/users';

import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { createGroupsStatsSelector } from '../../redux/selectors/stats';
import {
  groupsAssignmentsSelector,
  supervisorOfSelector,
  studentOfSelector
} from '../../redux/selectors/groups';
import { InfoIcon } from '../../components/icons';
import { getJsData } from '../../redux/helpers/resourceManager';

import withLinks from '../../hoc/withLinks';

class Dashboard extends Component {
  componentWillMount = () => this.props.loadAsync(this.props.userId);
  componentWillReceiveProps = newProps => {
    if (
      this.props.userId !== newProps.userId ||
      this.props.supervisorOf.size > newProps.supervisorOf.size ||
      this.props.studentOf.size > newProps.studentOf.size
    ) {
      newProps.loadAsync(newProps.userId);
    }
  };

  /**
   * A fairly complicated load method - uses redux thunk
   * to load the groups and necessary data for the intersection
   * of user's groups of which the current user is a supervisor.
   */
  static loadAsync = (params, dispatch, userId) =>
    dispatch((dispatch, getState) =>
      dispatch(fetchUserIfNeeded(userId)).then(() => {
        const state = getState();
        const user = getJsData(getUser(userId)(state));
        const groups = user.groups.studentOf.concat(user.groups.supervisorOf);

        return dispatch(fetchGroupsIfNeeded(...groups)).then(groups =>
          Promise.all(
            groups.map(({ value: group }) =>
              Promise.all([
                dispatch(fetchAssignmentsForGroup(group.id)),
                dispatch(fetchGroupsStatsIfNeeded(group.id))
              ]))
          ));
      }));

  render() {
    const {
      user,
      student,
      studentOf,
      studentOfGroupsIds,
      supervisor,
      supervisorOf,
      supervisorOfGroupsIds,
      groupAssignments,
      groupStatistics,
      usersStatistics,
      links: { GROUP_URI_FACTORY, INSTANCE_URI_FACTORY }
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
        {user => (
          <div>
            <p>
              <UsersNameContainer userId={user.id} large noLink />
            </p>

            {studentOfGroupsIds.length > 0 &&
              <ResourceRenderer resource={studentOf}>
                {(...groups) => (
                  <div>
                    <h2 className="page-heading">
                      <FormattedMessage
                        id="app.dashboard.studentOf"
                        defaultMessage="Groups you are student of"
                      />
                    </h2>

                    {groups.map(group => (
                      <div key={group.id}>
                        <ResourceRenderer
                          loading={
                            <Row>
                              <Col lg={4}>
                                <LoadingInfoBox title={group.name} />
                              </Col>
                            </Row>
                          }
                          resource={groupStatistics(group.id)}
                        >
                          {statistics => (
                            <Row>
                              <Col lg={4}>
                                <Link to={GROUP_URI_FACTORY(group.id)}>
                                  <UsersStats
                                    {...group}
                                    stats={usersStatistics(statistics)}
                                  />
                                </Link>
                              </Col>
                              <Col lg={8}>
                                <Box
                                  title={group.name}
                                  collapsable
                                  noPadding
                                  isOpen
                                  footer={
                                    <p className="text-center">
                                      <LinkContainer
                                        to={GROUP_URI_FACTORY(group.id)}
                                      >
                                        <Button bsSize="sm">
                                          <FormattedMessage
                                            id="app.user.groupDetail"
                                            defaultMessage="Show group's detail"
                                          />
                                        </Button>
                                      </LinkContainer>
                                    </p>
                                  }
                                >
                                  <AssignmentsTable
                                    userId={user.id}
                                    assignments={groupAssignments(group.id)}
                                    showGroup={false}
                                    statuses={
                                      usersStatistics(statistics).statuses
                                    }
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
              </ResourceRenderer>}

            {supervisorOfGroupsIds.length > 0 &&
              <Row>
                <Col sm={12}>
                  <h2 className="page-heading">
                    <FormattedMessage
                      id="app.dashboard.supervisorOf"
                      defaultMessage="Groups you supervise"
                    />
                  </h2>
                  <ResourceRenderer resource={supervisorOf}>
                    {(...groups) => (
                      <div>
                        {groups.map(group => (
                          <Row key={group.id}>
                            <Col lg={12}>
                              <ResourceRenderer
                                resource={groupStatistics(group.id)}
                              >
                                {statistics => (
                                  <Box
                                    title={group.name}
                                    collapsable
                                    noPadding
                                    isOpen
                                    footer={
                                      <p className="text-center">
                                        <LinkContainer
                                          to={GROUP_URI_FACTORY(group.id)}
                                        >
                                          <Button bsSize="sm">
                                            <FormattedMessage
                                              id="app.user.groupDetail"
                                              defaultMessage="Show group's detail"
                                            />
                                          </Button>
                                        </LinkContainer>
                                      </p>
                                    }
                                  >
                                    <StudentsListContainer groupId={group.id} />
                                  </Box>
                                )}
                              </ResourceRenderer>
                            </Col>
                          </Row>
                        ))}
                      </div>
                    )}
                  </ResourceRenderer>
                </Col>
              </Row>}

            {student &&
              studentOfGroupsIds.length === 0 &&
              <Row>
                <Col sm={12}>
                  <div className="callout callout-success">
                    <h4>
                      <InfoIcon />
                      {' '}
                      <FormattedMessage
                        id="app.user.welcomeTitle"
                        defaultMessage="Welcome to ReCodEx"
                      />
                    </h4>
                    <p>
                      <FormattedMessage
                        id="app.user.newAccount"
                        defaultMessage="Your account is ready, but you are not a member of any group yet. You should see the list of all the available groups and join some of them."
                        values={{ name: user.name }}
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

            {supervisor &&
              supervisorOfGroupsIds.length === 0 &&
              <Row>
                <Col sm={12}>
                  <div className="callout callout-success">
                    <h4>
                      <InfoIcon />
                      {' '}
                      <FormattedMessage
                        id="app.user.welcomeTitle"
                        defaultMessage="Welcome to ReCodEx"
                      />
                    </h4>
                    <p>
                      <FormattedMessage
                        id="app.user.newSupervisorAccount"
                        defaultMessage="Your account is ready, but you are not a member of any group yet. The administrator will assign you to a group and you will be able to manage the group afterwards."
                      />
                    </p>
                  </div>
                </Col>
              </Row>}
          </div>
        )}
      </Page>
    );
  }
}

Dashboard.propTypes = {
  user: ImmutablePropTypes.map,
  commonGroups: PropTypes.array,
  student: PropTypes.bool,
  studentOf: PropTypes.array,
  studentOfGroupsIds: PropTypes.array,
  supervisor: PropTypes.bool,
  supervisorOf: PropTypes.array,
  supervisorOfGroupsIds: PropTypes.array,
  superadmin: PropTypes.bool,
  loadAsync: PropTypes.func.isRequired,
  userId: PropTypes.string,
  groupAssignments: PropTypes.func.isRequired,
  groupStatistics: PropTypes.func.isRequired,
  usersStatistics: PropTypes.func.isRequired,
  links: PropTypes.object
};

export default withLinks(
  connect(
    state => {
      const userId = loggedInUserIdSelector(state);
      return {
        userId,
        student: isStudent(userId)(state),
        supervisor: isSupervisor(userId)(state),
        superadmin: isSuperAdmin(userId)(state),
        user: getUser(userId)(state),
        studentOfGroupsIds: studentOfGroupsIdsSelector(userId)(state).toArray(),
        studentOf: studentOfSelector(userId)(state).toArray(),
        supervisorOfGroupsIds: supervisorOfGroupsIdsSelector(userId)(
          state
        ).toArray(),
        supervisorOf: supervisorOfSelector(userId)(state).toArray(),
        groupAssignments: groupId => groupsAssignmentsSelector(groupId)(state),
        groupStatistics: groupId => createGroupsStatsSelector(groupId)(state),
        usersStatistics: statistics =>
          statistics.find(stat => stat.userId === userId) || {}
      };
    },
    (dispatch, { params }) => ({
      loadAsync: loggedInUserId =>
        Dashboard.loadAsync(params, dispatch, loggedInUserId)
    })
  )(Dashboard)
);
