import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { usersSelector } from '../../redux/selectors/users';
import { studentsOfGroup } from '../../redux/selectors/groups';
import { getAssignment } from '../../redux/selectors/assignments';
import { fetchStudents } from '../../redux/modules/users';
import { isReady, getJsData, getId } from '../../redux/helpers/resourceManager';
import SubmissionsTableContainer from '../../containers/SubmissionsTableContainer';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';

import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';

class AssignmentStats extends Component {

  static loadAsync = (
    { assignmentId },
    dispatch
  ) => Promise.all([
    dispatch(fetchAssignmentIfNeeded(assignmentId))
      .then((res) => res.value)
      .then(assignment => Promise.all([
        dispatch(fetchStudents(assignment.groupId))
      ]))
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
      students
    } = this.props;

    return (
      <PageContent
        title={(
          <ResourceRenderer resource={assignment}>
            {assignment => <span>{assignment.name}</span>}
          </ResourceRenderer>
        )}
        description={<FormattedMessage id="app.assignmentStats.title" defaultMessage="Assignment statistics" />}
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'group',
            breadcrumb: (assignment) => ({
              text: <FormattedMessage id="app.group.title" defaultMessage="Group detail" />,
              link: ({ GROUP_URI_FACTORY }) => GROUP_URI_FACTORY(assignment.groupId)
            })
          },
          {
            resource: assignment,
            iconName: 'puzzle-piece',
            breadcrumb: (assignment) => ({
              text: <FormattedMessage id="app.assignment.title" defaultMessage="Exercise assignment" />,
              link: ({ ASSIGNMENT_DETAIL_URI_FACTORY }) => ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id)
            })
          },
          {
            text: <FormattedMessage id="app.assignmentStats.title" defaultMessage="Assignment statistics" />,
            iconName: 'line-chart'
          }
        ]}>
        <div>
          {students.map(user => (
            <Row key={user.id}>
              <Col sm={12}>
                <SubmissionsTableContainer title={user.fullName} userId={user.id} assignmentId={assignmentId} />
              </Col>
            </Row>
          ))}
        </div>
      </PageContent>
    );
  }
}

AssignmentStats.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  assignment: PropTypes.object,
  students: ImmutablePropTypes.list.isRequired,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { params: { assignmentId } }) => {
    const assignment = getAssignment(assignmentId)(state);
    const studentsIds = isReady(assignment) ? studentsOfGroup(getJsData(assignment).groupId)(state) : List();
    const readyUsers = usersSelector(state).toList().filter(isReady);

    return {
      assignmentId,
      assignment,
      students: readyUsers.filter(isReady).filter(user => studentsIds.includes(getId(user))).map(getJsData)
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    loadAsync: () => AssignmentStats.loadAsync({ assignmentId }, dispatch)
  })
)(AssignmentStats);
