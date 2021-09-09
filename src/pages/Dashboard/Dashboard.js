import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Page from '../../components/layout/Page';
import { UserNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import Callout from '../../components/widgets/Callout';
import { LoadingInfoBox } from '../../components/widgets/InfoBox';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import StudentsListContainer from '../../containers/StudentsListContainer';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import UsersStats from '../../components/Users/UsersStats';
import GroupsName from '../../components/Groups/GroupsName';

import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchAllGroups } from '../../redux/modules/groups';
import { fetchGroupStatsIfNeeded } from '../../redux/modules/stats';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import { getUser, isStudent, isSupervisor, isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { statisticsSelector } from '../../redux/selectors/stats';
import {
  loggedInStudentOfGroupsAssignmentsSelector,
  loggedUserSupervisorOfGroupsSelector,
  loggedUserStudentOfGroupsSelector,
} from '../../redux/selectors/usersGroups';
import { assignmentEnvironmentsSelector } from '../../redux/selectors/assignments';

import { DashboardIcon, InfoIcon, GroupIcon, AssignmentsIcon } from '../../components/icons';
import { getLocalizedName } from '../../helpers/localizedData';
import withLinks from '../../helpers/withLinks';
import { EMPTY_OBJ } from '../../helpers/common';

class Dashboard extends Component {
  componentDidMount = () => this.props.loadAsync(this.props.userId);

  componentDidUpdate(prevProps) {
    if (
      this.props.userId !== prevProps.userId ||
      this.props.supervisorOf.size < prevProps.supervisorOf.size ||
      this.props.studentOf.size < prevProps.studentOf.size
    ) {
      this.props.loadAsync(this.props.userId);
    }
  }

  static customLoadGroups = true; // Marker for the App async load, that we will load groups ourselves.

  /**
   * A fairly complicated load method - uses redux thunk
   * to load the groups and necessary data for the intersection
   * of user's groups of which the current user is a supervisor.
   */
  static loadAsync = (params, dispatch, { userId }) =>
    Promise.all([
      dispatch(fetchUserIfNeeded(userId)),
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchAllGroups()).then(({ value: groups }) => {
        const interestingGroups = groups.filter(
          group =>
            (group.privateData && group.privateData.students && group.privateData.students.includes(userId)) ||
            (group.privateData && group.privateData.supervisors && group.privateData.supervisors.includes(userId)) ||
            (group.primaryAdminsIds && group.primaryAdminsIds.includes(userId))
        );
        return Promise.all(
          interestingGroups.map(({ id }) =>
            Promise.all([dispatch(fetchAssignmentsForGroup(id)), dispatch(fetchGroupStatsIfNeeded(id))])
          )
        );
      }),
    ]);

  usersStatistics(statistics) {
    return statistics.find(stat => stat.userId === this.props.userId) || EMPTY_OBJ;
  }

  render() {
    const {
      user,
      student,
      studentOf,
      supervisor,
      supervisorOf,
      groupAssignments,
      assignmentEnvironmentsSelector,
      statistics,
      links: { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY },
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={user}
        icon={<DashboardIcon />}
        title={<FormattedMessage id="app.dashboard.title" defaultMessage="Dashboard — a Complete Overview" />}>
        {user => (
          <div>
            <UserNavigation userId={user.id} canEdit isLoggedInUser />

            {student && studentOf.size === 0 && (
              <Row>
                <Col sm={12}>
                  <Callout variant="success">
                    <h4>
                      <InfoIcon gapRight />
                      <FormattedMessage id="app.dashboard.studentNoGroupsTitle" defaultMessage="No Group Memberships" />
                    </h4>
                    <p>
                      <FormattedMessage
                        id="app.dashboard.studentNoGroups"
                        defaultMessage="You are not a member of any group yet. A group supervisor may add you into his/her group, or you can use other mechanisms (like the dialog on the SIS integration page) to join some groups that apply to you."
                      />
                    </p>
                  </Callout>
                </Col>
              </Row>
            )}

            {supervisor && supervisorOf.size === 0 && (
              <Row>
                <Col sm={12}>
                  <Callout variant="success">
                    <h4>
                      <InfoIcon gapRight />
                      <FormattedMessage id="app.dashboard.supervisorNoGroupsTitle" defaultMessage="No Groups" />
                    </h4>
                    <p>
                      <FormattedMessage
                        id="app.dashboard.supervisorNoGroups"
                        defaultMessage="You are currently not supervising any groups. An administrator may create a group for you or you can use other mechanisms (like the dialog on the SIS integration page) to create groups for your students."
                      />
                    </p>
                  </Callout>
                </Col>
              </Row>
            )}

            {studentOf.size > 0 && (
              <ResourceRenderer resource={studentOf.toArray()} returnAsArray={true}>
                {groups => (
                  <div>
                    <h2 className="page-heading">
                      <FormattedMessage id="app.dashboard.memberOf" defaultMessage="Groups you are a member of" />
                    </h2>

                    {groups
                      .sort((a, b) => getLocalizedName(a, locale).localeCompare(getLocalizedName(b, locale), locale))
                      .map(group => (
                        <div key={group.id}>
                          {
                            <ResourceRenderer
                              loading={
                                <Row>
                                  <Col lg={4}>
                                    <LoadingInfoBox title={getLocalizedName(group, locale)} />
                                  </Col>
                                </Row>
                              }
                              resource={statistics.get(group.id)}>
                              {statistics => (
                                <Row>
                                  <Col lg={4}>
                                    <Link to={GROUP_DETAIL_URI_FACTORY(group.id)}>
                                      <UsersStats {...group} stats={this.usersStatistics(statistics)} />
                                    </Link>
                                  </Col>
                                  <Col lg={8}>
                                    <Box
                                      title={getLocalizedName(group, locale)}
                                      collapsable
                                      noPadding
                                      isOpen
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
                                                <FormattedMessage
                                                  id="app.group.assignments"
                                                  defaultMessage="Assignments"
                                                />
                                              </Button>
                                            </Link>
                                          </TheButtonGroup>
                                        </div>
                                      }
                                      unlimitedHeight>
                                      <AssignmentsTable
                                        userId={user.id}
                                        assignments={groupAssignments.get(group.id)}
                                        assignmentEnvironmentsSelector={assignmentEnvironmentsSelector}
                                        statuses={this.usersStatistics(statistics).assignments}
                                      />
                                    </Box>
                                  </Col>
                                </Row>
                              )}
                            </ResourceRenderer>
                          }
                        </div>
                      ))}
                  </div>
                )}
              </ResourceRenderer>
            )}

            {supervisorOf.size > 0 && (
              <Row>
                <Col sm={12}>
                  <h2 className="page-heading">
                    <FormattedMessage id="app.dashboard.supervisorOf" defaultMessage="Groups you supervise" />
                  </h2>

                  <ResourceRenderer resource={supervisorOf.toArray()} returnAsArray={true}>
                    {groups => (
                      <div>
                        {groups
                          .sort((a, b) =>
                            getLocalizedName(a, locale).localeCompare(getLocalizedName(b, locale), locale)
                          )
                          .map(group => (
                            <Row key={group.id}>
                              <Col lg={12}>
                                <ResourceRenderer resource={statistics.get(group.id)}>
                                  {statistics => (
                                    <Box
                                      title={<GroupsName {...group} translations />}
                                      collapsable
                                      noPadding
                                      isOpen
                                      footer={
                                        <div className="mb-3 text-center">
                                          <TheButtonGroup>
                                            <Link to={GROUP_INFO_URI_FACTORY(group.id)}>
                                              <Button size="sm">
                                                <InfoIcon gapRight />
                                                <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
                                              </Button>
                                            </Link>
                                            <Link to={GROUP_DETAIL_URI_FACTORY(group.id)}>
                                              <Button size="sm">
                                                <GroupIcon gapRight />
                                                <FormattedMessage
                                                  id="app.group.assignments"
                                                  defaultMessage="Assignments"
                                                />
                                              </Button>
                                            </Link>
                                          </TheButtonGroup>
                                        </div>
                                      }>
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
              </Row>
            )}
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
  studentOf: ImmutablePropTypes.map,
  supervisor: PropTypes.bool,
  supervisorOf: ImmutablePropTypes.map,
  superadmin: PropTypes.bool,
  loadAsync: PropTypes.func.isRequired,
  userId: PropTypes.string,
  groupAssignments: ImmutablePropTypes.map,
  assignmentEnvironmentsSelector: PropTypes.func,
  statistics: ImmutablePropTypes.map,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default withLinks(
  connect(
    state => {
      const userId = loggedInUserIdSelector(state);
      return {
        userId,
        student: isStudent(userId)(state),
        supervisor: isSupervisor(userId)(state),
        superadmin: isLoggedAsSuperAdmin(state),
        user: getUser(userId)(state),
        studentOf: loggedUserStudentOfGroupsSelector(state),
        supervisorOf: loggedUserSupervisorOfGroupsSelector(state),
        groupAssignments: loggedInStudentOfGroupsAssignmentsSelector(state),
        assignmentEnvironmentsSelector: assignmentEnvironmentsSelector(state),
        statistics: statisticsSelector(state),
      };
    },
    (dispatch, { match: { params } }) => ({
      loadAsync: userId => Dashboard.loadAsync(params, dispatch, { userId }),
    })
  )(injectIntl(Dashboard))
);
