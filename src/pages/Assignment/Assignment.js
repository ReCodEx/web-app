import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Col, Row } from 'react-bootstrap';

import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { canSubmit } from '../../redux/modules/canSubmit';
import { init } from '../../redux/modules/submission';
import { getAssignment } from '../../redux/selectors/assignments';
import { canSubmitSolution } from '../../redux/selectors/canSubmit';
import { isSubmitting } from '../../redux/selectors/submission';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isStudentOf, isSupervisorOf } from '../../redux/selectors/users';

import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';
import AssignmentDetails, {
  LoadingAssignmentDetails,
  FailedAssignmentDetails
} from '../../components/Assignments/Assignment/AssignmentDetails';
import LocalizedAssignments from '../../components/Assignments/Assignment/LocalizedAssignments';
import SubmitSolutionButton from '../../components/Assignments/SubmitSolutionButton';
import SubmitSolutionContainer from '../../containers/SubmitSolutionContainer';
import SubmissionsTableContainer from '../../containers/SubmissionsTableContainer';

class Assignment extends Component {

  static loadAsync = ({ assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchAssignmentIfNeeded(assignmentId)),
      dispatch(canSubmit(assignmentId))
    ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.assignmentId !== newProps.params.assignmentId) {
      newProps.loadAsync();
    }
  }

  isAfter = (unixTime) => {
    return unixTime * 1000 < Date.now();
  };

  render() {
    const {
      assignment,
      submitting,
      userId,
      init,
      isStudentOf,
      canSubmit
    } = this.props;

    return (
      <PageContent
        title={(
          <ResourceRenderer resource={assignment}>
            {assignment => <span>{assignment.name}</span>}
          </ResourceRenderer>
        )}
        description={<FormattedMessage id='app.assignment.title' defaultMessage='Exercise assignment' />}
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
          }
        ]}>
        <ResourceRenderer
          loading={<LoadingAssignmentDetails />}
          failed={<FailedAssignmentDetails />}
          resource={assignment}>
          {assignment => (
            <Row>
              <Col md={6}>
                <div>
                  {assignment.localizedAssignments.length > 0 &&
                    <LocalizedAssignments locales={assignment.localizedAssignments} />}

                  <AssignmentDetails
                    {...assignment}
                    isAfterFirstDeadline={this.isAfter(assignment.firstDeadline)}
                    isAfterSecondDeadline={this.isAfter(assignment.secondDeadline)}
                    canSubmit={canSubmit} />

                  {isStudentOf(assignment.groupId) && (
                    <div>
                      <p className='text-center'>
                        <ResourceRenderer
                          loading={<SubmitSolutionButton disabled={true} />}
                          resource={canSubmit}>
                          {canSubmit => <SubmitSolutionButton onClick={init(userId)} disabled={!canSubmit} />}
                        </ResourceRenderer>
                      </p>
                      <SubmitSolutionContainer
                        reset={init(userId)}
                        assignmentId={assignment.id}
                        isOpen={submitting} />
                    </div>
                  )}
                </div>
              </Col>
              <Col md={6}>
                {isStudentOf(assignment.groupId) && (
                  <SubmissionsTableContainer assignmentId={assignment.id} />
                )}
              </Col>
            </Row>
          )}
        </ResourceRenderer>
      </PageContent>
    );
  }

}

Assignment.propTypes = {
  userId: PropTypes.string.isRequired,
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired
  }),
  isStudentOf: PropTypes.func.isRequired,
  isSupervisorOf: PropTypes.func.isRequired,
  assignment: PropTypes.object,
  canSubmit: ImmutablePropTypes.map,
  submitting: PropTypes.bool.isRequired,
  init: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { params: { assignmentId } }) => {
    const assignmentSelector = getAssignment(assignmentId);
    const userId = loggedInUserIdSelector(state);
    return {
      assignment: assignmentSelector(state),
      submitting: isSubmitting(state),
      userId,
      isStudentOf: (groupId) => isStudentOf(userId, groupId)(state),
      isSupervisorOf: (groupId) => isSupervisorOf(userId, groupId)(state),
      canSubmit: canSubmitSolution(assignmentId)(state)
    };
  },
  (dispatch, { params: { assignmentId } }) => ({
    init: (userId) => () => dispatch(init(userId, assignmentId)),
    loadAsync: () => Assignment.loadAsync({ assignmentId }, dispatch)
  })
)(Assignment);
