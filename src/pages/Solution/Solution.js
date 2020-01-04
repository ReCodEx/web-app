import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';
import { defaultMemoize } from 'reselect';

import Page from '../../components/layout/Page';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import SolutionDetail, { FailedSubmissionDetail } from '../../components/Solutions/SolutionDetail';
import AcceptSolutionContainer from '../../containers/AcceptSolutionContainer';
import ReviewSolutionContainer from '../../containers/ReviewSolutionContainer';
import ResubmitSolutionContainer from '../../containers/ResubmitSolutionContainer';
import HierarchyLineContainer from '../../containers/HierarchyLineContainer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';

import { fetchRuntimeEnvironments } from '../../redux/modules/runtimeEnvironments';
import { fetchGroupStats } from '../../redux/modules/stats';
import { fetchAssignmentIfNeeded } from '../../redux/modules/assignments';
import { fetchSolution, fetchSolutionIfNeeded, setNote } from '../../redux/modules/solutions';
import {
  fetchSubmissionEvaluationsForSolution,
  deleteSubmissionEvaluation,
} from '../../redux/modules/submissionEvaluations';
import { getSolution } from '../../redux/selectors/solutions';
import { getAssignment, assignmentEnvironmentsSelector } from '../../redux/selectors/assignments';

import { evaluationsForSubmissionSelector, fetchManyStatus } from '../../redux/selectors/submissionEvaluations';
import { getLocalizedName } from '../../helpers/localizedData';
import { WarningIcon } from '../../components/icons';

const assignmentHasRuntime = defaultMemoize(
  (assignment, runtimeId) =>
    assignment.runtimeEnvironmentIds.find(id => id === runtimeId) !== undefined &&
    assignment.disabledRuntimeEnvironmentIds.find(id => id === runtimeId) === undefined
);

class Solution extends Component {
  static loadAsync = ({ solutionId, assignmentId }, dispatch) =>
    Promise.all([
      dispatch(fetchRuntimeEnvironments()),
      dispatch(fetchSolutionIfNeeded(solutionId)),
      dispatch(fetchSubmissionEvaluationsForSolution(solutionId)),
      dispatch(fetchAssignmentIfNeeded(assignmentId))
        .then(res => res.value)
        .then(assignment => dispatch(fetchGroupStats(assignment.groupId))),
    ]);

  componentDidMount = () => this.props.loadAsync();

  componentDidUpdate(prevProps) {
    if (this.props.match.params.solutionId !== prevProps.match.params.solutionId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      assignment,
      solution,
      match: {
        params: { assignmentId },
      },
      evaluations,
      runtimeEnvironments,
      fetchStatus,
      editNote,
      deleteEvaluation,
      refreshSolutionEvaluations,
      intl: { locale },
    } = this.props;

    return (
      <Page
        resource={assignment}
        title={assignment => getLocalizedName(assignment, locale)}
        description={<FormattedMessage id="app.submission.evaluation.title" defaultMessage="Solution evaluation" />}
        breadcrumbs={[
          {
            resource: assignment,
            iconName: 'tasks',
            breadcrumb: assignment => ({
              text: <FormattedMessage id="app.group.assignmentsLong" defaultMessage="Group Assignments" />,
              link: ({ GROUP_DETAIL_URI_FACTORY }) => GROUP_DETAIL_URI_FACTORY(assignment.groupId),
            }),
          },
          {
            resource: assignment,
            iconName: 'puzzle-piece',
            breadcrumb: assignment => ({
              text: <FormattedMessage id="app.exercise.title" defaultMessage="Exercise" />,
              link: ({ EXERCISE_URI_FACTORY }) =>
                assignment.permissionHints && assignment.permissionHints.viewDescription // not ideal, but closest we can get with permissions
                  ? EXERCISE_URI_FACTORY(assignment.exerciseId)
                  : '#',
            }),
          },
          {
            text: <FormattedMessage id="app.assignment.title" defaultMessage="Exercise Assignment" />,
            iconName: 'hourglass-start',
            link: ({ ASSIGNMENT_DETAIL_URI_FACTORY }) => ASSIGNMENT_DETAIL_URI_FACTORY(assignmentId),
          },
          {
            text: <FormattedMessage id="app.solution.title" defaultMessage="The Solution" />,
            iconName: 'user',
          },
        ]}>
        <ResourceRenderer failed={<FailedSubmissionDetail />} resource={[solution, assignment]}>
          {(solution, assignment) => (
            <div>
              <HierarchyLineContainer groupId={assignment.groupId} />
              {((solution.permissionHints && solution.permissionHints.setFlag) ||
                (assignment.permissionHints && assignment.permissionHints.resubmitSubmissions)) && (
                <p>
                  {solution.permissionHints && solution.permissionHints.setFlag && (
                    <React.Fragment>
                      <AcceptSolutionContainer id={solution.id} locale={locale} />
                      <ReviewSolutionContainer id={solution.id} locale={locale} />
                    </React.Fragment>
                  )}

                  {assignment.permissionHints &&
                  assignment.permissionHints.resubmitSubmissions &&
                  assignmentHasRuntime(assignment, solution.runtimeEnvironmentId) ? (
                    <React.Fragment>
                      <ResubmitSolutionContainer
                        id={solution.id}
                        assignmentId={assignment.id}
                        isDebug={false}
                        userId={solution.solution.userId}
                        locale={locale}
                      />
                      <ResubmitSolutionContainer
                        id={solution.id}
                        assignmentId={assignment.id}
                        isDebug={true}
                        userId={solution.solution.userId}
                        locale={locale}
                      />
                    </React.Fragment>
                  ) : (
                    <span>
                      <WarningIcon largeGapLeft gapRight className="text-warning" />
                      <FormattedMessage
                        id="app.solution.environmentNotAllowedCannotResubmit"
                        defaultMessage="The assignment no longer supports the environment for which this solution was evaluated. Resubmission is not possible."
                      />
                    </span>
                  )}
                </p>
              )}
              <ResourceRenderer resource={runtimeEnvironments} returnAsArray>
                {runtimes => (
                  <FetchManyResourceRenderer fetchManyStatus={fetchStatus}>
                    {() => (
                      <SolutionDetail
                        solution={solution}
                        assignment={assignment}
                        evaluations={evaluations}
                        runtimeEnvironments={runtimes}
                        deleteEvaluation={deleteEvaluation}
                        refreshSolutionEvaluations={refreshSolutionEvaluations}
                        editNote={solution.permissionHints && solution.permissionHints.update ? editNote : null}
                      />
                    )}
                  </FetchManyResourceRenderer>
                )}
              </ResourceRenderer>
            </div>
          )}
        </ResourceRenderer>
      </Page>
    );
  }
}

Solution.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      assignmentId: PropTypes.string.isRequired,
      solutionId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  assignment: PropTypes.object,
  children: PropTypes.element,
  solution: PropTypes.object,
  loadAsync: PropTypes.func.isRequired,
  evaluations: PropTypes.object,
  runtimeEnvironments: PropTypes.array,
  fetchStatus: PropTypes.string,
  editNote: PropTypes.func.isRequired,
  deleteEvaluation: PropTypes.func.isRequired,
  refreshSolutionEvaluations: PropTypes.func.isRequired,
  intl: intlShape,
};

export default connect(
  (
    state,
    {
      match: {
        params: { solutionId, assignmentId },
      },
    }
  ) => ({
    solution: getSolution(solutionId)(state),
    assignment: getAssignment(state)(assignmentId),
    evaluations: evaluationsForSubmissionSelector(solutionId)(state),
    runtimeEnvironments: assignmentEnvironmentsSelector(state)(assignmentId),
    fetchStatus: fetchManyStatus(solutionId)(state),
  }),
  (dispatch, { match: { params } }) => ({
    loadAsync: () => Solution.loadAsync(params, dispatch),
    editNote: note => dispatch(setNote(params.solutionId, note)),
    refreshSolutionEvaluations: () =>
      Promise.all([
        dispatch(fetchSolution(params.solutionId)),
        dispatch(fetchSubmissionEvaluationsForSolution(params.solutionId)),
      ]),
    deleteEvaluation: evaluationId =>
      dispatch(deleteSubmissionEvaluation(params.solutionId, evaluationId)).then(() =>
        dispatch(fetchSolutionIfNeeded(params.solutionId))
      ),
  })
)(injectIntl(Solution));
