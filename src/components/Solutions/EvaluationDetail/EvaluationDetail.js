import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table } from 'react-bootstrap';

import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import Icon, { SuccessOrFailureIcon, BugIcon } from '../../icons';

const EvaluationDetail = ({
  evaluation,
  isCorrect,
  submittedAt,
  maxPoints,
  accepted,
  evaluationStatus,
  isDebug,
  viewResumbissions = false
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
    <Table>
      <tbody>
        <tr>
          <td className="text-center">
            <Icon icon={['far', 'clock']} />
          </td>
          <th className="text-nowrap">
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
          <th className="text-nowrap">
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
          <th className="text-nowrap">
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
          <th className="text-nowrap">
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
                  defaultMessage="The solution is correct and meets all criteria."
                />}
              {evaluationStatus === 'work-in-progress' &&
                <FormattedMessage
                  id="app.submission.evaluation.status.workInProgress"
                  defaultMessage="The solution has not been evaluated yet."
                />}
              {evaluationStatus === 'failed' &&
                <FormattedMessage
                  id="app.submission.evaluation.status.failed"
                  defaultMessage="The solution does not meet the defined criteria."
                />}
              {evaluationStatus === 'evaluation-failed' &&
                <FormattedMessage
                  id="app.submission.evaluation.status.systemFailiure"
                  defaultMessage="Evaluation process failed and your submission could not have been evaluated. Please submit the solution once more. If you keep receiving errors please contact the administrator of this project."
                />}
              {evaluationStatus === 'missing-submission' &&
                <FormattedMessage
                  id="app.submission.evaluation.status.solutionMissingSubmission"
                  defaultMessage="The solution was not submitted for evaluation. This was probably caused by an error in the assignment configuration."
                />}
            </em>
          </td>
        </tr>

        {viewResumbissions &&
          <tr>
            <td className="text-center">
              <BugIcon />
            </td>
            <th className="text-nowrap">
              <FormattedMessage
                id="app.evaluationDetail.isDebug"
                defaultMessage="Debug Mode"
              />:
            </th>
            <td>
              <SuccessOrFailureIcon success={isDebug} />
            </td>
          </tr>}
      </tbody>
    </Table>
  </Box>;

EvaluationDetail.propTypes = {
  isCorrect: PropTypes.bool.isRequired,
  submittedAt: PropTypes.number.isRequired,
  evaluation: PropTypes.object,
  maxPoints: PropTypes.number.isRequired,
  accepted: PropTypes.bool,
  evaluationStatus: PropTypes.string.isRequired,
  isDebug: PropTypes.bool.isRequired,
  viewResumbissions: PropTypes.bool
};

export default EvaluationDetail;
