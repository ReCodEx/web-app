import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';

import Box from '../../widgets/Box';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import withLinks from '../../../helpers/withLinks';
import { EditIcon, SuccessOrFailureIcon } from '../../icons';

const SubmissionStatus = ({
  assignment: { firstDeadline, allowSecondDeadline, secondDeadline },
  evaluationStatus,
  submittedAt,
  userId,
  submittedBy,
  note,
  accepted,
  originalSubmissionId = null,
  assignment,
  environment,
  links: { SUBMISSION_DETAIL_URI_FACTORY }
}) =>
  <Box
    title={
      <FormattedMessage id="app.solution.title" defaultMessage="The Solution" />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
  >
    <Table>
      <tbody>
        {note.length > 0 &&
          <tr>
            <td className="text-center">
              <EditIcon />
            </td>
            <th>
              <FormattedMessage
                id="app.submission.note"
                defaultMessage="Note:"
              />
            </th>
            <td>
              {note}
            </td>
          </tr>}

        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon={['far', 'clock']} />
          </td>
          <th>
            <FormattedMessage
              id="app.solution.submittedAt"
              defaultMessage="Submitted at"
            />:
          </th>
          <td>
            <FormattedDate value={submittedAt * 1000} />
            &nbsp;
            <FormattedTime value={submittedAt * 1000} />
          </td>
        </tr>

        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon="hourglass-start" />
          </td>
          <th>
            <FormattedMessage
              id="app.solution.beforeFirstDeadline"
              defaultMessage="Before the deadline"
            />:
          </th>
          <td>
            <SuccessOrFailureIcon success={submittedAt < firstDeadline} />
          </td>
        </tr>

        {submittedAt >= firstDeadline &&
          allowSecondDeadline === true &&
          <tr>
            <td className="text-center">
              <FontAwesomeIcon icon="hourglass-end" />
            </td>
            <th>
              <FormattedMessage
                id="app.solution.beforeSecondDeadline"
                defaultMessage="Before the second deadline"
              />:
            </th>
            <td>
              <SuccessOrFailureIcon success={submittedAt < secondDeadline} />
            </td>
          </tr>}

        <tr>
          <td className="text-center">
            <FontAwesomeIcon icon="user" />
          </td>
          <th>
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            <UsersNameContainer userId={userId} showEmail="icon" />
          </td>
        </tr>

        {Boolean(submittedBy) &&
          submittedBy !== userId &&
          <tr>
            <td className="text-center">
              <FontAwesomeIcon icon="user" />
            </td>
            <th>
              <FormattedMessage
                id="app.submission.reevaluatedBy"
                defaultMessage="Reevaluated by:"
              />
            </th>
            <td>
              <UsersNameContainer userId={submittedBy} showEmail="icon" />
            </td>
          </tr>}

        {Boolean(environment) &&
          Boolean(environment.name) &&
          <tr>
            <td className="text-center">
              <FontAwesomeIcon icon="code" />
            </td>
            <th>
              <FormattedMessage
                id="app.submission.environment"
                defaultMessage="Target language:"
              />
            </th>
            <td>
              {environment.name}
            </td>
          </tr>}

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
          <th>
            <FormattedMessage
              id="app.submission.evaluationStatus"
              defaultMessage="Evaluation Status:"
            />
          </th>
          <td>
            <strong>
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
            </strong>
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>;

SubmissionStatus.propTypes = {
  assignment: PropTypes.shape({
    firstDeadline: PropTypes.number.isRequired,
    allowSecondDeadline: PropTypes.bool.isRequired,
    secondDeadline: PropTypes.number
  }).isRequired,
  evaluationStatus: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string,
  note: PropTypes.string,
  accepted: PropTypes.bool,
  originalSubmissionId: PropTypes.string,
  environment: PropTypes.object,
  links: PropTypes.object.isRequired
};

export default withLinks(SubmissionStatus);
