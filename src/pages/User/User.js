import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Set } from 'immutable';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';

import Page from '../../components/Page';
import Box from '../../components/AdminLTE/Box';
import { LoadingInfoBox } from '../../components/AdminLTE/InfoBox';
import ResourceRenderer from '../../components/ResourceRenderer';
import UsersNameContainer from '../../containers/UsersNameContainer';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import UsersStats from '../../components/Users/UsersStats';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchGroupsIfNeeded } from '../../redux/modules/groups';
import { getUser } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { createGroupsStatsSelector } from '../../redux/selectors/stats';
import { groupsAssignmentsSelector, studentOfSelector, supervisorOfSelector } from '../../redux/selectors/groups';
import { EditIcon, InfoIcon } from '../../components/Icons';
import { getJsData } from '../../redux/helpers/resourceManager';

class User extends Component {

  componentWillMount = () => this.props.loadAsync(this.props.loggedInUserId);
  componentWillReceiveProps = (newProps) => {
    if (this.props.params.userId !== newProps.params.userId ||
      this.props.commonGroups.size > newProps.commonGroups.size) {
      newProps.loadAsync(newProps.loggedInUserId);
    }
  };

  /**
   * A fairly complicated load method - uses redux thunk
   * to load the groups and necessary data for the intersection
   * of user's groups of which the current user is a supervisor.
   */
  static loadAsync = ({ userId }, dispatch, loggedInUserId) =>
    dispatch(
      (dispatch, getState) =>
        dispatch(fetchUserIfNeeded(userId))
          .then(() => dispatch(fetchUserIfNeeded(loggedInUserId)))
          .then(() => {
            const state = getState();
            const user = getJsData(getUser(userId)(state));
            const currentUser = getJsData(getUser(loggedInUserId)(state));

            let commonGroupsIds;
            if (userId === loggedInUserId) {
              commonGroupsIds = user.groups.studentOf;
            } else {
              commonGroupsIds = Set(user.groups.studentOf).intersect(Set(currentUser.groups.supervisorOf)).toArray();
            }

            return dispatch(fetchGroupsIfNeeded(...commonGroupsIds))
              .then((groups) => Promise.all(
                groups.map(({ value: group }) => Promise.all([
                  dispatch(fetchAssignmentsForGroup(group.id)),
                  dispatch(fetchGroupsStatsIfNeeded(group.id))
                ]))
              ));
          })
    );

  render() {
    const {
      user,
      commonGroups,
      loggedInUserId,
      groupAssignments,
      groupStatistics,
      usersStatistics
    } = this.props;

    const {
      links: { EDIT_USER_URI_FACTORY, GROUP_URI_FACTORY, INSTANCE_URI_FACTORY }
    } = this.context;

    return (
      <Page
        resource={user}
        title={<FormattedMessage id='app.user.title' defaultMessage="User's profile" />}
        description={<FormattedMessage id='app.user.description' defaultMessage="All of the user's progress in all groups." />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.user.title' defaultMessage="User's profile" />,
            iconName: 'user'
          }
        ]}>
        {user => (
          <div>
            <Row>
              <Col xs={12}>
                <p>
                  <UsersNameContainer userId={user.id} large noLink />
                </p>
                {user.id === loggedInUserId && (
                  <p>
                    <LinkContainer to={EDIT_USER_URI_FACTORY(user.id)}>
                      <Button bsStyle='default' className='btn-flat'>
                        <EditIcon /> <FormattedMessage id='app.user.editUser' defaultMessage='Edit profile information' />
                      </Button>
                    </LinkContainer>
                  </p>
                )}
              </Col>
            </Row>

            {commonGroups.length > 0 && (
              <ResourceRenderer resource={commonGroups}>
                {(...groups) => (
                  <div>
                    {groups.map((group) => (
                      <div key={group.id} >
                        <ResourceRenderer
                          loading={
                            <Row>
                              <Col lg={4}>
                                <LoadingInfoBox title={group.name} />
                              </Col>
                            </Row>
                          }
                          resource={groupStatistics(group.id)}>
                          {(statistics) => (
                            <Row>
                              <Col lg={4}>
                                <Link to={GROUP_URI_FACTORY(group.id)}>
                                  <UsersStats {...group} stats={usersStatistics(statistics)} />
                                </Link>
                              </Col>
                              <Col lg={8}>
                                <Box
                                  title={group.name}
                                  collapsable
                                  noPadding
                                  isOpen
                                  footer={(
                                    <p className='text-center'>
                                      <LinkContainer to={GROUP_URI_FACTORY(group.id)}>
                                        <Button bsSize='sm' className='btn-flat'>
                                          <FormattedMessage id='app.user.groupDetail' defaultMessage="Show group's detail" />
                                        </Button>
                                      </LinkContainer>
                                    </p>
                                  )}>
                                  <AssignmentsTable
                                    assignments={groupAssignments(group.id)}
                                    showGroup={false}
                                    statuses={usersStatistics(statistics).statuses} />
                                </Box>
                              </Col>
                            </Row>
                          )}
                        </ResourceRenderer>
                      </div>
                    ))}

                </div>
              )}
            </ResourceRenderer>
          )}

          {commonGroups.length === 0 && user.id !== loggedInUserId && (
            <div className='callout callout-warning'>
              <h4><InfoIcon />{' '}<FormattedMessage id='app.user.nothingInCommon.title' defaultMessage='You are not a supervisor' /></h4>
              <FormattedMessage
                id='app.user.noCommonGroups'
                defaultMessage="You are not a supervisor of any group of which is {name} a member and so you don't see any of his results."
                values={{ name: user.fullName }} />
            </div>
          )}

          {commonGroups.length === 0 && user.id === loggedInUserId && (
            <Row>
              <Col sm={12}>
                <div className='callout callout-success'>
                  <h4>
                    <InfoIcon /> <FormattedMessage id='app.user.welcomeTitle' defaultMessage='Welcome to ReCodEx' />
                  </h4>
                  <p>
                    <FormattedMessage
                      id='app.user.newAccount'
                      defaultMessage="Your account is ready, but you are not a member of any group yet. You should see the list of all the available groups and join some of them."
                      values={{ name: user.name }} />
                  </p>
                  <p className='text-center'>
                    <LinkContainer to={INSTANCE_URI_FACTORY(user.instanceId)}>
                      <Button bsStyle='success' className='btn-flat'>
                        <FormattedMessage id='app.user.examineGroupsInstance' defaultMessage='Find your groups' />
                      </Button>
                    </LinkContainer>
                  </p>
                </div>
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
  user: ImmutablePropTypes.map,
  commonGroups: PropTypes.array,
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  loggedInUserId: PropTypes.string,
  groupAssignments: PropTypes.func.isRequired,
  groupStatistics: PropTypes.func.isRequired,
  usersStatistics: PropTypes.func.isRequired
};

User.contextTypes = {
  links: PropTypes.object
};

export default connect(
  (state, { params: { userId } }) => {
    const loggedInUserId = loggedInUserIdSelector(state);
    const studentOf = studentOfSelector(userId)(state).toList().toSet();
    const supervisorOf = supervisorOfSelector(loggedInUserId)(state).toList().toSet();
    const commonGroups = userId === loggedInUserId
      ? studentOf.toArray()
      : studentOf.intersect(supervisorOf).toArray();

    return {
      loggedInUserId,
      user: getUser(userId)(state),
      groupAssignments: (groupId) => groupsAssignmentsSelector(groupId)(state),
      groupStatistics: (groupId) => createGroupsStatsSelector(groupId)(state),
      usersStatistics: (statistics) => statistics.find(stat => stat.userId === userId) || {},
      commonGroups
    };
  },
  (dispatch, { params }) => ({
    loadAsync: (loggedInUserId) => User.loadAsync(params, dispatch, loggedInUserId)
  })
)(User);
