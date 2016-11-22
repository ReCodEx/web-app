import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button, Row, Col } from 'react-bootstrap';
import Box from '../../components/AdminLTE/Box';
import { LinkContainer } from 'react-router-bootstrap';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { fetchUsersGroups } from '../../redux/modules/groups';
import { groupsAssignmentsSelector, studentOfSelector } from '../../redux/selectors/groups';
import { fetchAssignmentsForGroup } from '../../redux/modules/assignments';
import Page from '../../components/Page';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import { getStatuses } from '../../redux/selectors/stats';
import { fetchGroupsStatsIfNeeded } from '../../redux/modules/stats';

class Dashboard extends Component {

  componentWillMount = () => this.props.loadAsync(this.props.userId);
  componentWillReceiveProps = (newProps) => {
    if (this.props.userId !== newProps.userId) {
      newProps.loadAsync(newProps.userId);
    }
  };

  loadData = (params, dispatch, userId) =>
    dispatch(fetchUsersGroups(userId))
      .then(({ value: { student } }) => Promise.all(
        student.map(
          ({ id }) => Promise.all([
            dispatch(fetchAssignmentsForGroup(id)),
            dispatch(fetchGroupsStatsIfNeeded(id))
          ])
        )
      ));

  render() {
    const {
      user,
      groups,
      groupAssignments,
      groupStatuses
    } = this.props;

    const {
      links: { GROUP_URI_FACTORY }
    } = this.context;

    return (
      <Page
        resource={[ user, ...groups ]}
        title={() => <FormattedMessage id='app.dashboard.title' defaultMessage='Dashboard' />}
        description={(user) => user.fullName}>
        {(user, ...groups) => (
          <Row>
            {groups.map((group) => (
              <Col key={group.id} md={6}>
                <Box key={`box-${group.id}`}
                  title={group.name}
                  collapsable
                  noPadding
                  isOpen
                  footer={(
                    <p className='text-center'>
                      <LinkContainer to={GROUP_URI_FACTORY(group.id)}>
                        <Button bsSize='sm' className='btn-flat'>
                          <FormattedMessage id='app.dashboard.groupDetail' defaultMessage="Show group's detail" />
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
          </Row>
        )}
      </Page>
    );
  }

}

Dashboard.propTypes = {
  userId: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  groups: PropTypes.array,
  groupAssignments: PropTypes.func.isRequired,
  groupStatuses: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired
};

Dashboard.contextTypes = {
  links: PropTypes.object
};

export default connect(
  state => {
    const userId = loggedInUserIdSelector(state);
    const user = loggedInUserSelector(state);
    const groups = studentOfSelector(userId)(state);
    return {
      userId,
      user,
      groups: groups ? groups.toArray() : [],
      groupAssignments: (groupId) => groupsAssignmentsSelector(groupId)(state),
      groupStatuses: (groupId) => getStatuses(groupId, userId)(state)
    };
  },
  (dispatch) => ({
    loadAsync: (userId) => Dashboard.loadAsync({}, dispatch, userId),
  })
)(Dashboard);
