import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import classnames from 'classnames';

import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import withLinks from '../../../helpers/withLinks';
import Icon, { EditIcon, SuccessOrFailureIcon, CodeIcon } from '../../icons';

const SolutionStatus = ({
  assignment: { firstDeadline, allowSecondDeadline, secondDeadline },
  evaluationStatus,
  submittedAt,
  userId,
  submittedBy,
  note,
  accepted,
  environment,
  maxPoints,
  bonusPoints,
  actualPoints,
  links: { SOLUTION_DETAIL_URI_FACTORY },
}) => (
  <Box
    title={
      <FormattedMessage id="app.solution.title" defaultMessage="The Solution" />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}>
    <Table>
      <tbody>
        {note.length > 0 && (
          <tr>
            <td className="text-center">
              <EditIcon />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.solution.note" defaultMessage="Note:" />
            </th>
            <td>{note}</td>
          </tr>
        )}

        <tr>
          <td className="text-center">
            <Icon icon={['far', 'clock']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.solution.submittedAt"
              defaultMessage="Submitted at"
            />
            :
          </th>
          <td>
            <DateTime unixts={submittedAt} showRelative />
          </td>
        </tr>

        <tr>
          <td className="text-center">
            <Icon icon="hourglass-start" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.solution.beforeFirstDeadline"
              defaultMessage="Before the deadline"
            />
            :
          </th>
          <td>
            <SuccessOrFailureIcon success={submittedAt < firstDeadline} />
          </td>
        </tr>

        {submittedAt >= firstDeadline && allowSecondDeadline === true && (
          <tr>
            <td className="text-center">
              <Icon icon="hourglass-end" />
            </td>
            <th className="text-nowrap">
              <FormattedMessage
                id="app.solution.beforeSecondDeadline"
                defaultMessage="Before the second deadline"
              />
              :
            </th>
            <td>
              <SuccessOrFailureIcon success={submittedAt < secondDeadline} />
            </td>
          </tr>
        )}

        <tr>
          <td className="text-center">
            <Icon icon="user" />
          </td>
          <th className="text-nowrap">
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            <UsersNameContainer userId={userId} showEmail="icon" />
          </td>
        </tr>

        {Boolean(submittedBy) && submittedBy !== userId && (
          <tr>
            <td className="text-center">
              <Icon icon="user" />
            </td>
            <th className="text-nowrap">
              <FormattedMessage
                id="app.solution.reevaluatedBy"
                defaultMessage="Re-evaluated by"
              />
              :
            </th>
            <td>
              <UsersNameContainer userId={submittedBy} showEmail="icon" />
            </td>
          </tr>
        )}

        {Boolean(environment) && Boolean(environment.name) && (
          <tr>
            <td className="text-center">
              <CodeIcon />
            </td>
            <th className="text-nowrap">
              <FormattedMessage
                id="app.solution.environment"
                defaultMessage="Target language:"
              />
            </th>
            <td>
              <EnvironmentsListItem
                runtimeEnvironment={environment}
                longNames={true}
              />
            </td>
          </tr>
        )}

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
              id="app.solution.lastEvaluationStatus"
              defaultMessage="Last evaluation status"
            />
            :
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

        <tr>
          <td className="text-center">
            <Icon icon={['far', 'star']} />
          </td>
          <th className="text-nowrap">
            <FormattedMessage
              id="app.solution.scoredPoints"
              defaultMessage="Final score"
            />
            :
          </th>
          <td
            className={classnames({
              'text-danger': actualPoints + bonusPoints <= 0,
              'text-success': actualPoints + bonusPoints > 0,
            })}>
            <b>
              {actualPoints || 0}
              {bonusPoints !== 0
                ? (bonusPoints >= 0 ? '+' : '') + bonusPoints
                : ''}{' '}
              / {maxPoints}
            </b>
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

SolutionStatus.propTypes = {
  assignment: PropTypes.shape({
    firstDeadline: PropTypes.number.isRequired,
    allowSecondDeadline: PropTypes.bool.isRequired,
    secondDeadline: PropTypes.number,
  }).isRequired,
  evaluationStatus: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string,
  note: PropTypes.string,
  accepted: PropTypes.bool,
  environment: PropTypes.object,
  maxPoints: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  actualPoints: PropTypes.number,
  links: PropTypes.object.isRequired,
};

export default withLinks(SolutionStatus);
