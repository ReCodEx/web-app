import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { injectIntl, FormattedMessage } from 'react-intl';
import { usersSelector } from '../../redux/selectors/users';
import { groupSelector, studentsOfGroup } from '../../redux/selectors/groups';
import { getAssignment } from '../../redux/selectors/assignments';
import { fetchStudents } from '../../redux/modules/users';
import { isReady, getJsData, getId } from '../../redux/helpers/resourceManager';
import SubmissionsTableContainer from '../../containers/SubmissionsTableContainer';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchGroupIfNeeded } from '../../redux/modules/groups';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

class AssignmentStats extends Component {
  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId))
        .then(res => res.value)
        .then(assignment =>
          Promise.all([
            dispatch(fetchGroupIfNeeded(assignment.groupId)),
            dispatch(fetchStudents(assignment.groupId))
          ])
        )
    ]);

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
      getStudents,
      getGroup,
      intl
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={
          <ResourceRenderer resource={assignment}>
            {assignment =>
              <span>
                {assignment.name}
              </span>}
          </ResourceRenderer>
        }
        description={
          <FormattedMessage
            id="app.assignmentStats.title"
            defaultMessage="Assignment statistics"
          />
        }
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'group',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.group.title"
                  defaultMessage="Group detail"
                />
              ),
              link: ({ GROUP_URI_FACTORY }) =>
                GROUP_URI_FACTORY(assignment.groupId)
            })
          },
          {
            resource: assignment,
            iconName: 'puzzle-piece',
            breadcrumb: assignment => ({
              text: (
                <FormattedMessage
                  id="app.assignment.title"
                  defaultMessage="Exercise assignment"
                />
              ),
              link: ({ ASSIGNMENT_DETAIL_URI_FACTORY }) =>
                ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id)
            })
          },
          {
            text: (
              <FormattedMessage
                id="app.assignmentStats.title"
                defaultMessage="Assignment statistics"
              />
            ),
            iconName: 'line-chart'
          }
        ]}
      >
        {assignment =>
          <div>
            <ResourceRenderer resource={getGroup(assignment.groupId)}>
              {group =>
                <div>
                  {getStudents(group.id)
                    .sort((a, b) => {
                      const aName = a.name.lastName + ' ' + a.name.firstName;
                      const bName = b.name.lastName + ' ' + b.name.firstName;
                      return aName.localeCompare(bName, intl.locale);
                    })
                    .map(user =>
                      <Row key={user.id}>
                        <Col sm={12}>
                          <SubmissionsTableContainer
                            title={user.fullName}
                            userId={user.id}
                            assignmentId={assignmentId}
                          />
                        </Col>
                      </Row>
                    )}
                </div>}
            </ResourceRenderer>
          </div>}
      </Page>
    );
  }
}

AssignmentStats.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  assignment: PropTypes.object,
  getStudents: PropTypes.func.isRequired,
  getGroup: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default connect(
  (state, { params: { assignmentId } }) => {
    const assignment = getAssignment(assignmentId)(state);
    const getStudentsIds = groupId => studentsOfGroup(groupId)(state);
    const readyUsers = usersSelector(state).toList().filter(isReady);

    return {
      assignmentId,
      assignment,
      getStudentsIds,
      getStudents: groupId =>
        readyUsers
          .filter(user => getStudentsIds(groupId).includes(getId(user)))
          .map(getJsData),
      getGroup: id => groupSelector(id)(state)
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    loadAsync: () => AssignmentStats.loadAsync({ assignmentId }, dispatch)
  })
)(injectIntl(AssignmentStats));
