import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import Box from '../../components/AdminLTE/Box';
import { Link } from 'react-router';
import Page from '../../components/Page';
import ResourceRenderer from '../../components/ResourceRenderer';
import UsersStats from '../../components/Users/UsersStats';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import { loggedInUserId } from '../../redux/selectors/auth';
import { loggedInUserSelector, studentOfGroupsIdsSelector } from '../../redux/selectors/users';
import { groupSelector, groupsAssignmentsSelector, fetchGroupIfNeeded } from '../../redux/selectors/groups';
import { fetchUserIfNeeded } from '../../redux/modules/users';
import PageContent from '../../components/PageContent';
import AssignmentsTable from '../../components/Assignments/Assignment/AssignmentsTable';
import { getStatuses } from '../../redux/selectors/stats';


class Dashboard extends Component {

  render() {
    const {
      user,
      groups,
      groupAssignments,
      groupStatuses,
      getGroupData
    } = this.props;

    return (
      <PageContent
        title={<FormattedMessage id='app.dashboard.title' defaultMessage='Dashboard' />}
        description={<FormattedMessage id='app.dashboard.description' defaultMessage='Dashboard' />}
        breadcrumbs={[
          {
            iconName: 'home',
            text: <FormattedMessage id='app.dashboard.title' defaultMessage='Dashboard' />
          }
        ]}>

        <div>
        {groups && groups.map(groupId =>
          <Row key={`row-${groupId}`}>
            <Col sm={6} key={`col1-${groupId}`}>
              <UsersStats {...getGroupData(groupId)} key={`badge=${groupId}`} />
            </Col>
            <Col sm={6} key={`col2-${groupId}`}>
              <Box key={`box-${groupId}`}
                title={<FormattedMessage id='app.dashboard.group' defaultMessage='Group {groupName}' values={{ groupName: groupId }} />}
                collapsable
                noPadding
                isOpen>
                <AssignmentsTable
                  assignments={groupAssignments(groupId)}
                  showGroup={false}
                  statuses={groupStatuses(groupId)} />
              </Box>
            </Col>
          </Row>
        )}
        </div>

      </PageContent>
    );
  }

}

Dashboard.propTypes = {

};

export default connect(
  state => {
    const user = loggedInUserSelector(state);
    return {
      user,
      groups: isReady(user) ? studentOfGroupsIdsSelector(getJsData(user).id)(state) : List(),
      groupAssignments: (groupId) => groupsAssignmentsSelector(groupId)(state),
      groupStatuses: (groupId) => isReady(user) ? getStatuses(groupId, getJsData(user).id)(state) : List(),
      getGroupData: (groupId) => groupSelector(groupId)
    }
  },
  (dispatch, { params }) => ({

  })
)(Dashboard);
