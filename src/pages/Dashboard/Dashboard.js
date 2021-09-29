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
import StudentsListContainer from '../../containers/StudentsListContainer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import GroupsNameContainer from '../../containers/GroupsNameContainer';
import AssignmentsTableContainer from '../../containers/AssignmentsTableContainer';
import ShadowAssignmentsTableContainer from '../../containers/ShadowAssignmentsTableContainer';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchAllGroups } from '../../redux/modules/groups';
import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';

import { getUser, isStudent, isSupervisor, isLoggedAsSuperAdmin } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { groupsLoggedUserIsMemberSelector, fetchManyGroupsStatus } from '../../redux/selectors/groups';

import { DashboardIcon, InfoIcon, GroupIcon, AssignmentsIcon, SupervisorIcon } from '../../components/icons';
import withLinks from '../../helpers/withLinks';
import { safeGet } from '../../helpers/common';

const INITIAL_LOADING_THRESHOLD = 3; // if there are more groups, the boxes will be collapsed and data loaded on demand

class Dashboard extends Component {
  componentDidMount = () => this.props.loadAsync(this.props.userId);

  componentDidUpdate(prevProps) {
    if (this.props.userId !== prevProps.userId) {
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
      dispatch(fetchAllGroups()),
    ]);

  render() {
    const {
      user,
      student,
      supervisor,
      memberGroups,
      fetchManyGroupsStatus,
      links: { GROUP_INFO_URI_FACTORY, GROUP_DETAIL_URI_FACTORY },
    } = this.props;

    const memberGroupsAdminOrSupervisor = [
      ...safeGet(memberGroups, 'admin', []),
      ...safeGet(memberGroups, 'supervisor', []),
    ];

    return (
      <Page
        resource={user}
        icon={<DashboardIcon />}
        title={<FormattedMessage id="app.dashboard.title" defaultMessage="Dashboard — a Complete Overview" />}>
        {user => (
          <div>
            <UserNavigation userId={user.id} canEdit isLoggedInUser />

            <FetchManyResourceRenderer fetchManyStatus={fetchManyGroupsStatus}>
              {() => (
                <>
                  {student && (
                    <>
                      {!memberGroups.student || memberGroups.student.length === 0 ? (
                        <Row>
                          <Col sm={12}>
                            <Callout variant="success">
                              <h4>
                                <InfoIcon gapRight />
                                <FormattedMessage
                                  id="app.dashboard.studentNoGroupsTitle"
                                  defaultMessage="No Group Memberships"
                                />
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
                      ) : (
                        <div>
                          <h3 className="mt-4 mb-3">
                            <GroupIcon gapLeft gapRight className="text-muted" />
                            <FormattedMessage id="app.dashboard.memberOf" defaultMessage="Groups you are a member of" />
                          </h3>

                          {memberGroups.student.map(groupId => (
                            <Box
                              key={groupId}
                              title={<GroupsNameContainer groupId={groupId} fullName admins links />}
                              collapsable
                              noPadding
                              isOpen={memberGroups.student.length <= INITIAL_LOADING_THRESHOLD}
                              footer={
                                <div className="mb-2 text-center">
                                  <TheButtonGroup>
                                    <Link to={GROUP_INFO_URI_FACTORY(groupId)}>
                                      <Button size="sm">
                                        <GroupIcon gapRight />
                                        <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
                                      </Button>
                                    </Link>
                                    <Link to={GROUP_DETAIL_URI_FACTORY(groupId)}>
                                      <Button size="sm">
                                        <AssignmentsIcon gapRight />
                                        <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
                                      </Button>
                                    </Link>
                                  </TheButtonGroup>
                                </div>
                              }
                              unlimitedHeight>
                              <>
                                <AssignmentsTableContainer userId={user.id} groupId={groupId} onlyCurrent hideEmpty />
                                <ShadowAssignmentsTableContainer userId={user.id} groupId={groupId} hideEmpty />
                              </>
                            </Box>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {supervisor && (!student || memberGroupsAdminOrSupervisor.length > 0) && (
                    <>
                      {memberGroupsAdminOrSupervisor.length === 0 ? (
                        <Row>
                          <Col sm={12}>
                            <Callout variant="info">
                              <h4>
                                <FormattedMessage
                                  id="app.dashboard.supervisorNoGroupsTitle"
                                  defaultMessage="No Groups"
                                />
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
                      ) : (
                        <div>
                          <h3 className="mt-4 mb-3">
                            <SupervisorIcon gapLeft gapRight className="text-muted" />
                            <FormattedMessage
                              id="app.dashboard.supervisorOf"
                              defaultMessage="Groups managed by you (as admin or supervisor)"
                            />
                          </h3>

                          {memberGroupsAdminOrSupervisor.map(groupId => (
                            <Box
                              key={groupId}
                              title={<GroupsNameContainer groupId={groupId} fullName admins links />}
                              collapsable
                              noPadding
                              isOpen={memberGroupsAdminOrSupervisor.length <= INITIAL_LOADING_THRESHOLD}
                              footer={
                                <div className="mb-2 text-center">
                                  <TheButtonGroup>
                                    <Link to={GROUP_INFO_URI_FACTORY(groupId)}>
                                      <Button size="sm">
                                        <GroupIcon gapRight />
                                        <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
                                      </Button>
                                    </Link>
                                    <Link to={GROUP_DETAIL_URI_FACTORY(groupId)}>
                                      <Button size="sm">
                                        <AssignmentsIcon gapRight />
                                        <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
                                      </Button>
                                    </Link>
                                  </TheButtonGroup>
                                </div>
                              }
                              unlimitedHeight>
                              <StudentsListContainer groupId={groupId} />
                            </Box>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </FetchManyResourceRenderer>
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
  supervisor: PropTypes.bool,
  superadmin: PropTypes.bool,
  loadAsync: PropTypes.func.isRequired,
  userId: PropTypes.string,
  memberGroups: PropTypes.object.isRequired,
  fetchManyGroupsStatus: PropTypes.string,
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
        memberGroups: groupsLoggedUserIsMemberSelector(state),
        fetchManyGroupsStatus: fetchManyGroupsStatus(state),
      };
    },
    (dispatch, { match: { params } }) => ({
      loadAsync: userId => Dashboard.loadAsync(params, dispatch, { userId }),
    })
  )(injectIntl(Dashboard))
);
