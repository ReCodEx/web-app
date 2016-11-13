import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Col, Row, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { usersSelector, isStudentOf, isSupervisorOf } from '../../redux/selectors/users';
import { studentsOfGroup } from '../../redux/selectors/groups';
import { getAssignment } from '../../redux/selectors/assignments';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { fetchSupervisors, fetchStudents } from '../../redux/modules/users';
import { isReady, isLoading, hasFailed, getData, getJsData, getId } from '../../redux/helpers/resourceManager';
import SubmissionsTableContainer from '../../containers/SubmissionsTableContainer';

import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';


class AssignmentStats extends Component {

  static loadAsync = (
    { assignmentId },
    dispatch
  ) => Promise.all([
    dispatch(fetchStudents(getAssignment(assignmentId).groupId))
  ])

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.assignmentId !== newProps.assignmentId) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      assignmentId,
      assignment,
      userId,
      students
    } = this.props;

    return (
      <PageContent
        title={(
          <ResourceRenderer resource={assignment}>
            {assignment => <span>{assignment.name}</span>}
          </ResourceRenderer>
        )}
        description={<FormattedMessage id='app.assignmentStats.title' defaultMessage='Assignment statistics' />}
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'group',
            breadcrumb: (assignment) => ({
              text: <FormattedMessage id='app.group.title' defaultMessage='Group detail' />,
              link: ({ GROUP_URI_FACTORY }) => GROUP_URI_FACTORY(assignment.groupId)
            })
          },
          {
            text: <FormattedMessage id='app.assignment.title' defaultMessage='Exercise assignment' />,
            iconName: 'puzzle-piece'
          },
          {
            text: <FormattedMessage id='app.assignmentStats.title' defaultMessage='Assignment statistics' />,
            iconName: 'line-chart'
          }
        ]}>

        <div>
          {students.map(user => (
            <div key={user.id}>
              <strong>{user.fullName}</strong>
              <SubmissionsTableContainer userId={user.id} assignmentId={assignmentId} />
            </div>
          ))}
        </div>

      </PageContent>
    );
  }

}


AssignmentStats.propTypes = {

};

export default connect(
  (state, { params: { assignmentId } }) => {
    const assignmentSelector = getAssignment(assignmentId);
    const userId = loggedInUserIdSelector(state);
    const studentsIds = studentsOfGroup("a23ff9d9-5e42-11e6-a34f-180373206d10")(state);  // @todo: Get 'groupId' property from assignment
    const readyUsers = usersSelector(state).toList().filter(isReady);

    return {
      assignmentId,
      assignment: assignmentSelector(state),
      userId,
      students: readyUsers.filter(isReady).filter(user => studentsIds.includes(getId(user))).map(getJsData),
      isStudentOf: (groupId) => isStudentOf(userId, groupId)(state),
      isSupervisorOf: (groupId) => isSupervisorOf(userId, groupId)(state),
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    init: (userId) => () => dispatch(init(userId, assignmentId)),
    loadAsync: () => AssignmentStats.loadAsync({ assignmentId }, dispatch)
  })
)(AssignmentStats);
