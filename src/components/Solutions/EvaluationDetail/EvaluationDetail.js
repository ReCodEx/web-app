import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';

import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Explanation from '../../widgets/Explanation';
import Icon, { SuccessOrFailureIcon, BugIcon } from '../../icons';

const EvaluationDetail = ({
  evaluation,
  isCorrect,
  submittedAt,
  maxPoints = null,
  accepted,
  evaluationStatus = null,
  isDebug,
  viewResumbissions = false,
  showScoreDetail = null,
  referenceSolution = false,
}) => (
  <Box
    title={<FormattedMessage id="app.evaluationDetail.title.details" defaultMessage="Evaluation Details" />}
    noPadding={true}
    collapsable={true}
    isOpen={true}>
    <Table responsive size="sm" className="mb-1">
      <tbody>
        <tr>
          <td className="text-center text-muted shrink-col px-2">
            <Icon icon={['far', 'clock']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.evaluationDetail.evaluatedAt" defaultMessage="Evaluated at:" />
            <Explanation id="evaluatedAt">
              <FormattedMessage
                id="app.evaluationDetail.explanations.evaluatedAt"
                defaultMessage="Time when the evaluation has concluded. It may differ from the time of submission if the evaluation took long of if the solution was re-evaluated."
              />
            </Explanation>
          </th>
          <td>
            <DateTime unixts={evaluation.evaluatedAt} showRelative showSeconds />
          </td>
        </tr>

        <tr>
          <td className="text-center text-muted shrink-col px-2">
            <Icon icon="cogs" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.evaluationDetail.buildSucceeded" defaultMessage="Build succeeded:" />
            <Explanation id="buildSucceeded">
              <FormattedMessage
                id="app.evaluationDetail.explanations.buildSucceeded"
                defaultMessage="Whether the compilation of the solution succeeded. If the compilation fails, the solution is not executed."
              />
            </Explanation>
          </th>
          <td>
            <SuccessOrFailureIcon success={!evaluation.initFailed} />
          </td>
        </tr>

        <tr>
          <td className="text-center text-muted shrink-col px-2">
            <Icon icon="percent" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="app.evaluationDetail.isCorrect" defaultMessage="Correctness" />:
            <Explanation id="correctness">
              <FormattedMessage
                id="app.evaluationDetail.explanations.correctness"
                defaultMessage="Overall correctness of the solution. There are multiple options how the correcntess of solution is computed from the test results. Use the explanation link to see how the correctness was computed."
              />
            </Explanation>
          </th>
          <td
            className={classnames({
              'text-danger': !isCorrect,
              'text-success': isCorrect,
            })}>
            <b>
              <FormattedNumber style="percent" maximumFractionDigits={3} value={evaluation.score} />
            </b>
            {showScoreDetail && (
              <span className="float-right clickable text-primary mx-2" onClick={showScoreDetail}>
                <small>
                  <FormattedMessage id="generic.explain" defaultMessage="explain" />
                </small>
                <Icon icon="calculator" gapLeft />
              </span>
            )}
          </td>
        </tr>

        {!referenceSolution && maxPoints !== null && (
          <tr>
            <td className="text-center text-muted shrink-col px-2">
              <Icon icon={['far', 'star']} />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.evaluationDetail.scoredPoints" defaultMessage="Scored points" />:
              <Explanation id="scoredPoints">
                <FormattedMessage
                  id="app.evaluationDetail.explanations.scoredPoints"
                  defaultMessage="Points scored for this evaluation by ReCodEx. This may differ from the final score since the teacher may choose to override the points."
                />
              </Explanation>
            </th>
            <td
              className={classnames({
                'text-danger': !isCorrect || evaluation.points <= 0,
                'text-success': isCorrect && evaluation.points > 0,
              })}>
              <b>
                {evaluation.points} / {maxPoints}
              </b>
            </td>
          </tr>
        )}

        {!referenceSolution && (
          <tr>
            <td className="text-center text-muted shrink-col px-2">
              <b>
                <AssignmentStatusIcon id={String(submittedAt)} status={evaluationStatus} accepted={accepted} />
              </b>
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.submission.evaluationStatus" defaultMessage="Evaluation status" />:
            </th>
            <td>
              <em>
                {evaluationStatus === 'done' && (
                  <FormattedMessage
                    id="app.submission.evaluation.status.isCorrect"
                    defaultMessage="The solution is correct and meets all criteria."
                  />
                )}
                {evaluationStatus === 'work-in-progress' && (
                  <FormattedMessage
                    id="app.submission.evaluation.status.workInProgress"
                    defaultMessage="The solution has not been evaluated yet."
                  />
                )}
                {evaluationStatus === 'failed' && (
                  <FormattedMessage
                    id="app.submission.evaluation.status.failed"
                    defaultMessage="The solution does not meet the defined criteria."
                  />
                )}
                {evaluationStatus === 'evaluation-failed' && (
                  <FormattedMessage
                    id="app.submission.evaluation.status.systemFailiure"
                    defaultMessage="Evaluation process failed and your submission could not have been evaluated. Please submit the solution once more. If you keep receiving errors please contact the administrator of this project."
                  />
                )}
                {evaluationStatus === 'missing-submission' && (
                  <FormattedMessage
                    id="app.submission.evaluation.status.solutionMissingSubmission"
                    defaultMessage="The solution was not submitted for evaluation. This was probably caused by an error in the assignment configuration."
                  />
                )}
              </em>
            </td>
          </tr>
        )}

        {viewResumbissions && (
          <tr>
            <td className="text-center text-muted shrink-col px-2">
              <BugIcon />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.evaluationDetail.isDebug" defaultMessage="Debug Mode" />:
              <Explanation id="isDebug">
                <FormattedMessage
                  id="app.evaluationDetail.explanations.isDebug"
                  defaultMessage="In debugging mode, the detailed evaluation logs retain also the outputs of the executed solution which may be quite large."
                />
              </Explanation>
            </th>
            <td>
              <SuccessOrFailureIcon success={isDebug} />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </Box>
);

EvaluationDetail.propTypes = {
  isCorrect: PropTypes.bool.isRequired,
  submittedAt: PropTypes.number.isRequired,
  evaluation: PropTypes.object,
  maxPoints: PropTypes.number,
  accepted: PropTypes.bool,
  evaluationStatus: PropTypes.string,
  isDebug: PropTypes.bool.isRequired,
  viewResumbissions: PropTypes.bool,
  showScoreDetail: PropTypes.func,
  referenceSolution: PropTypes.bool,
};

export default EvaluationDetail;
