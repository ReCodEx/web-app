import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import Box from '../../widgets/Box';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import withLinks from '../../../hoc/withLinks';

const SubmissionStatus = ({
  evaluationStatus,
  submittedAt,
  userId,
  submittedBy,
  note,
  accepted,
  originalSubmissionId = null,
  assignmentId,
  links: { SUBMISSION_DETAIL_URI_FACTORY }
}) =>
  <Box
    title={
      <FormattedMessage id="app.submission.title" defaultMessage="Solution" />
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
              <Icon name="pencil" />
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
            <Icon name="clock-o" />
          </td>
          <th>
            <FormattedMessage
              id="app.submission.submittedAt"
              defaultMessage="Submitted at:"
            />
          </th>
          <td>
            <FormattedDate value={submittedAt * 1000} />
            &nbsp;
            <FormattedTime value={submittedAt * 1000} />
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <Icon name="user" />
          </td>
          <th>
            <FormattedMessage
              id="app.submission.author"
              defaultMessage="Author:"
            />
          </th>
          <td>
            <UsersNameContainer userId={userId} />
          </td>
        </tr>
        {submittedBy &&
          submittedBy !== userId &&
          <tr>
            <td className="text-center">
              <Icon name="user" />
            </td>
            <th>
              <FormattedMessage
                id="app.submission.reevaluatedBy"
                defaultMessage="Reevaluated by:"
              />
            </th>
            <td>
              <UsersNameContainer userId={submittedBy} />
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
              id="app.submission.isCorrect"
              defaultMessage="Solution is correct:"
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
            </strong>
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>;

SubmissionStatus.propTypes = {
  evaluationStatus: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  userId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string,
  note: PropTypes.string,
  accepted: PropTypes.bool,
  originalSubmissionId: PropTypes.string,
  assignmentId: PropTypes.string.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(SubmissionStatus);
