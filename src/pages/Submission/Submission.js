import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl } from 'react-intl';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SubmissionDetail, {
  FailedSubmissionDetail
} from '../../components/Submissions/SubmissionDetail';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';
import ResubmitSolutionContainer from '../../containers/ResubmitSolutionContainer';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';

import { fetchGroupsStats } from '../../redux/modules/stats';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSubmissionIfNeeded } from '../../redux/modules/submissions';
import { getSubmission } from '../../redux/selectors/submissions';
import { getAssignment } from '../../redux/selectors/assignments';
import {
  isSupervisorOf,
  isAdminOf,
  isSuperAdmin
} from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { getLocalizedName } from '../../helpers/getLocalizedData';

class Submission extends Component {
  static loadAsync = ({ submissionId, assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchSubmissionIfNeeded(submissionId)),
      dispatch(fetchAssignmentIfNeeded(assignmentId))
        .then(res => res.value)
        .then(assignment => dispatch(fetchGroupsStats(assignment.groupId)))
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
      isSupervisorOrMore,
      intl: { locale }
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => getLocalizedName(assignment, locale)}
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
          {(submission, assignment) =>
            <div>
              <HierarchyLineContainer groupId={assignment.groupId} />
              {isSupervisorOrMore(assignment.groupId) &&
                <p>
                  <AcceptSolutionContainer id={submission.id} />
                  <ResubmitSolutionContainer
                    id={submission.id}
                    assignmentId={assignment.id}
                  />
                </p>}
              <SubmissionDetail
                submission={submission}
                assignment={assignment}
                isSupervisor={isSupervisorOrMore(assignment.groupId)}
              />
            </div>}
        </ResourceRenderer>
      </Page>
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
  isSupervisorOrMore: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(
  connect(
    (state, { params: { submissionId, assignmentId } }) => ({
      submission: getSubmission(submissionId)(state),
      assignment: getAssignment(assignmentId)(state),
      isSupervisorOrMore: groupId =>
        isSupervisorOf(loggedInUserIdSelector(state), groupId)(state) ||
        isAdminOf(loggedInUserIdSelector(state), groupId)(state) ||
        isSuperAdmin(loggedInUserIdSelector(state))(state)
    }),
    (dispatch, { params }) => ({
      loadAsync: () => Submission.loadAsync(params, dispatch)
    })
  )(Submission)
);
