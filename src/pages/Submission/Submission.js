import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import PageContent from '../../components/layout/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';
import SubmissionDetail, {
  FailedSubmissionDetail
} from '../../components/Submissions/SubmissionDetail';

import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSubmissionIfNeeded } from '../../redux/modules/submissions';
import { getSubmission } from '../../redux/selectors/submissions';
import { getAssignment } from '../../redux/selectors/assignments';
import { isSupervisorOf } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

class Submission extends Component {
  static loadAsync = ({ submissionId, assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchSubmissionIfNeeded(submissionId)),
      dispatch(fetchAssignmentIfNeeded(assignmentId))
    ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.submissionId !== newProps.params.submissionId) {
      newProps.loadAsync();
    }
  }

  render() {
    const {
      assignment,
      submission,
      params: { assignmentId },
      isSupervisorOf
    } = this.props;

    return (
      <PageContent
        title={
          <ResourceRenderer resource={assignment} noIcons>
            {assignmentData => <span>{assignmentData.name}</span>}
          </ResourceRenderer>
        }
        description={
          <FormattedMessage
            id="app.submission.evaluation.title"
            defaultMessage="Solution evaluation"
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
            text: (
              <FormattedMessage
                id="app.assignment.title"
                defaultMessage="Exercise assignment"
              />
            ),
            iconName: 'puzzle-piece',
            link: ({ ASSIGNMENT_DETAIL_URI_FACTORY }) =>
              ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId)
          },
          {
            text: (
              <FormattedMessage
                id="app.submission.title"
                defaultMessage="Solution"
              />
            ),
            iconName: 'user'
          }
        ]}
      >
        <ResourceRenderer
          failed={<FailedSubmissionDetail />}
          resource={[submission, assignment]}
        >
          {(submission, assignment) => (
            <SubmissionDetail
              submission={submission}
              assignment={assignment}
              isSupervisor={isSupervisorOf(assignment.groupId)}
            />
          )}
        </ResourceRenderer>
      </PageContent>
    );
  }
}

Submission.propTypes = {
  params: PropTypes.shape({
    assignmentId: PropTypes.string.isRequired,
    submissionId: PropTypes.string.isRequired
  }).isRequired,
  assignment: PropTypes.object,
  children: PropTypes.element,
  submission: PropTypes.object,
  loadAsync: PropTypes.func.isRequired,
  isSupervisorOf: PropTypes.func.isRequired
};

export default connect(
  (state, { params: { submissionId, assignmentId } }) => ({
    submission: getSubmission(submissionId)(state),
    assignment: getAssignment(assignmentId)(state),
    isSupervisorOf: groupId =>
      isSupervisorOf(loggedInUserIdSelector(state), groupId)(state)
  }),
  (dispatch, { params }) => ({
    loadAsync: () => Submission.loadAsync(params, dispatch)
  })
)(Submission);
