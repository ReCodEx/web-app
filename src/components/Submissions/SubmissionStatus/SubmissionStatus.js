import React, { PropTypes } from 'react';
import { Table } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import Box from '../../AdminLTE/Box';
import AssignmentStatusIcon from '../../Assignments/Assignment/AssignmentStatusIcon';

const SubmissionStatus = ({
  evaluationStatus,
  submittedAt,
  note
}) => (
  <Box
    title={<FormattedMessage id='app.submission.title' defaultMessage='Your solution' />}
    noPadding={true}
    collapsable={true}
    isOpen={true}>
    <Table>
      <tbody>
        {note.length > 0 && (
          <tr>
            <td className='text-center'>
              <Icon name='pencil' />
            </td>
            <th><FormattedMessage id='app.submission.yourNote' defaultMessage='Your note:' /></th>
            <td>{note}</td>
          </tr>
        )}
        <tr>
          <td className='text-center'>
            <Icon name='clock-o' />
          </td>
          <th><FormattedMessage id='app.submission.submittedAt' defaultMessage='Submitted at:' /></th>
          <td>
            <FormattedDate value={submittedAt * 1000} />&nbsp;<FormattedTime value={submittedAt * 1000} />
          </td>
        </tr>
        <tr>
          <td className='text-center'>
            <b><AssignmentStatusIcon status={evaluationStatus} /></b>
          </td>
          <th><FormattedMessage id='app.submission.isCorrect' defaultMessage='Your solution is correct:' /></th>
          <td>
            <strong>
              {evaluationStatus === 'done' &&
                <FormattedMessage id='app.submission.evaluation.status.isCorrect' defaultMessage='Your solution is correct and meets all criteria.' />}
              {evaluationStatus === 'work-in-progress' &&
                <FormattedMessage id='app.submission.evaluation.status.workInProgress' defaultMessage='Your solution has not been evaluated yet.' />}
              {evaluationStatus === 'failed' &&
                <FormattedMessage id='app.submission.evaluation.status.failed' defaultMessage='Your solution does not meet the defined criteria.' />}
              {evaluationStatus === 'evaluation-failed' &&
                <FormattedMessage id='app.submission.evaluation.status.systemFailiure' defaultMessage={`Evaluation process had failed and your submission
                  could not have been evaluated. Please submit your solution once more. If you keep receiving errors please contact the administrator of this project.`} />}
            </strong>
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

SubmissionStatus.propTypes = {
  evaluationStatus: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  note: PropTypes.string
};

export default SubmissionStatus;
