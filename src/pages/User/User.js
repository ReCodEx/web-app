import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import Page from '../../components/Page';
import Box from '../../components/AdminLTE/Box';
import ResourceRenderer from '../../components/ResourceRenderer';
import UsersNameContainer from '../../containers/UsersNameContainer';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import { fetchGroupsIfNeeded } from '../../redux/modules/groups';
import { getUser } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';
import { getStatuses } from '../../redux/selectors/stats';
import { groupsAssignmentsSelector, studentOfSelector, supervisorOfSelector } from '../../redux/selectors/groups';
import { EditIcon, InfoIcon } from '../../components/Icons';

class User extends Component {

  componentWillMount = () => this.props.loadAsync(this.props.loggedInUserId);
  componentWillReceiveProps = (newProps) => {
    if (this.props.params.userId !== newProps.params.userId) {
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
        dispatch(fetchUserIfNeeded(userId)).then(() => {
          const state = getState();
          const studentOf = studentOfSelector(userId)(state).toList().toSet();
          const supervisorOf = supervisorOfSelector(loggedInUserId)(state).toList().toSet();
          const commonGroups = userId === loggedInUserId
            ? studentOf.toArray()
            : studentOf.intersect(supervisorOf).toArray();

          return dispatch(fetchGroupsIfNeeded(...commonGroups))
            .then((groups) => Promise.all(
              groups.map(({ value: group }) => Promise.all([
                dispatch(fetchAssignmentsForGroup(group.id)),
                dispatch(fetchGroupsStatsIfNeeded(group.id))
              ]))
            )
          );
        })
    );


  render() {
    const {
      user,
      commonGroups,
      loggedInUserId,
      groupStatuses,
      groupAssignments
    } = this.props;
    const {
      links: { EDIT_USER_URI_FACTORY, GROUP_URI_FACTORY }
    } = this.context;
    return (
      <Page
        resource={user}
        title={(user) => <UsersNameContainer userId={user.id} />}
        description={<FormattedMessage id='app.user.title' defaultMessage="User's profile" />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.user.title' defaultMessage="User's profile" />,
            iconName: 'user'
          }
        ]}>
        {user => (
          <div>
            {user.id === loggedInUserId && (
              <p>
                <LinkContainer to={EDIT_USER_URI_FACTORY(user.id)}>
                  <Button bsStyle='default' className='btn-flat'>
                    <EditIcon /> <FormattedMessage id='app.user.editUser' defaultMessage='Edit profile information' />
                  </Button>
                </LinkContainer>
              </p>
            )}

            <ResourceRenderer resource={commonGroups}>
              {(...groups) => (
                <Row>
                  {groups.map((group) => (
                    <Col key={group.id} md={6}>
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
                          statuses={groupStatuses(group.id)} />
                      </Box>
                    </Col>
                  ))}

                  {!groups && user.id !== loggedInUserId && (
                    <Alert bsStyle='info'>
                      <InfoIcon />
                      <FormattedMessage
                        id='app.user.noCommonGroups'
                        defaultMessage="You are not a supervisor of any group of which is {name} a member"
                        values={{ name: user.name }} />
                    </Alert>
                  )}
                </Row>
              )}
            </ResourceRenderer>
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
  groupStatuses: PropTypes.func.isRequired
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
      groupStatuses: (groupId) => getStatuses(groupId, userId)(state),
      commonGroups
    };
  },
  (dispatch, { params }) => ({
    loadAsync: (loggedInUserId) => User.loadAsync(params, dispatch, loggedInUserId)
  })
)(User);
