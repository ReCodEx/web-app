import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';

import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Icon, { SuccessOrFailureIcon } from '../../icons';

const EvaluationDetail = ({
  evaluation,
  isCorrect,
  submittedAt,
  maxPoints,
  accepted,
  evaluationStatus
}) =>
  <Box
    title={
      <FormattedMessage
        id="app.evaluationDetail.title.details"
        defaultMessage="Evaluation Details"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
  >
    <div>
      <Table>
        <tbody>
          <tr>
            <td className="text-center">
              <Icon icon={['far', 'clock']} />
            </td>
            <th>
              <FormattedMessage
                id="app.evaluationDetail.evaluatedAt"
                defaultMessage="Evaluated at:"
              />
            </th>
            <td>
              <DateTime
                unixts={evaluation.evaluatedAt}
                showRelative
                showSeconds
              />
            </td>
          </tr>

          <tr>
            <td className="text-center">
              <Icon icon="cogs" />
            </td>
            <th>
              <FormattedMessage
                id="app.evaluationDetail.buildSucceeded"
                defaultMessage="Build succeeded:"
              />
            </th>
            <td>
              <SuccessOrFailureIcon success={!evaluation.initFailed} />
            </td>
          </tr>

          <tr>
            <td className="text-center">
              <Icon icon="percent" />
            </td>
            <th>
              <FormattedMessage
                id="app.evaluationDetail.isCorrect"
                defaultMessage="Correctness"
              />:
            </th>
            <td
              className={classnames({
                'text-danger': !isCorrect,
                'text-success': isCorrect
              })}
            >
              <b>
                <FormattedNumber style="percent" value={evaluation.score} />
              </b>
            </td>
          </tr>

          <tr>
            <td className="text-center">
              <Icon icon={['far', 'star']} />
            </td>
            <th>
              <FormattedMessage
                id="app.evaluationDetail.scoredPoints"
                defaultMessage="Scored points"
              />:
            </th>
            <td
              className={classnames({
                'text-danger': !isCorrect || evaluation.points <= 0,
                'text-success': isCorrect && evaluation.points > 0
              })}
            >
              <b>
                {evaluation.points} / {maxPoints}
              </b>
            </td>
          </tr>

          <tr>
            <td className="text-center">
              <b>
                <AssignmentStatusIcon
                  id={String(submittedAt)}
                  status={evaluationStatus}
                  accepted={accepted}
                />
              </b>
            </td>
            <th className="text-nowrap">
              <FormattedMessage
                id="app.submission.evaluationStatus"
                defaultMessage="Evaluation status"
              />:
            </th>
            <td>
              <em>
                {evaluationStatus === 'done' &&
                  <FormattedMessage
                    id="app.submission.evaluation.status.isCorrect"
                    defaultMessage="Solution is correct and meets all criteria."
                  />}
                {evaluationStatus === 'work-in-progress' &&
                  <FormattedMessage
                    id="app.submission.evaluation.status.workInProgress"
                    defaultMessage="Solution has not been evaluated yet."
                  />}
                {evaluationStatus === 'failed' &&
                  <FormattedMessage
                    id="app.submission.evaluation.status.failed"
                    defaultMessage="Solution does not meet the defined criteria."
                  />}
                {evaluationStatus === 'evaluation-failed' &&
                  <FormattedMessage
                    id="app.submission.evaluation.status.systemFailiure"
                    defaultMessage="Evaluation process had failed and your submission could not have been evaluated. Please submit the solution once more. If you keep receiving errors please contact the administrator of this project."
                  />}
                {evaluationStatus === 'missing-submission' &&
                  <FormattedMessage
                    id="app.submission.evaluation.status.solutionMissingSubmission"
                    defaultMessage="Solution was not submitted for evaluation. This was probably caused by an error in the assignment configuration."
                  />}
              </em>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  </Box>;

EvaluationDetail.propTypes = {
  isCorrect: PropTypes.bool.isRequired,
  submittedAt: PropTypes.number.isRequired,
  evaluation: PropTypes.object,
  maxPoints: PropTypes.number.isRequired,
  accepted: PropTypes.bool,
  evaluationStatus: PropTypes.string.isRequired
};

export default EvaluationDetail;
