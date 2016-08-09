
import React, { PropTypes } from 'react';

import { Table } from 'react-bootstrap';
import Box from '../Box';
import { SUBMISSION_DETAIL_URI_FACTORY } from '../../links';
import { isReady, hasFailed, isLoading } from '../../redux/helpers/resourceManager';

import LoadingSubmissionTableRow from './LoadingSubmissionTableRow';
import NoSolutionYetTableRow from './NoSolutionYetTableRow';
import SuccessfulSubmissionTableRow from './SuccessfulSubmissionTableRow';
import FailedSubmissionTableRow from './FailedSubmissionTableRow';
import FailedLoadingSubmissionTableRow from './FailedLoadingSubmissionTableRow';
import NotEvaluatedSubmissionTableRow from './NotEvaluatedSubmissionTableRow';
import EvaluationFailedTableRow from './EvaluationFailedTableRow';

const SubmissionsTable = ({
  assignmentId,
  submissions
}) => (
  <Box title='Odevzdaná řešení' collapsable isOpen={true}>
    <Table>
      <thead>
        <tr>
          <th></th>
          <th>Datum odevzdání</th>
          <th className='text-center'>Úspěšnost řešení</th>
          <th className='text-center'>Počet bodů</th>
          <th>Poznámka</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {!submissions && <LoadingSubmissionTableRow />}
        {!!submissions && submissions.length > 0 &&
          submissions.map((submission, i) => {
            if (hasFailed(submission)) {
              return <FailedLoadingSubmissionTableRow key={i} />;
            } else if (isLoading(submission)) {
              return <LoadingSubmissionTableRow key={i} />;
            }

            const link = SUBMISSION_DETAIL_URI_FACTORY(assignmentId, submission.data.id);
            switch (submission.data.evaluationStatus) {
              case 'done':
                return <SuccessfulSubmissionTableRow {...submission.data} key={submission.data.id} link={link} />;
              case 'failed':
                return <FailedSubmissionTableRow {...submission.data} key={submission.data.id} link={link} />;
              case 'work-in-progress':
                return <NotEvaluatedSubmissionTableRow {...submission.data} key={submission.data.id} link={link} />;
              case 'evaluation-failed':
                return <EvaluationFailedTableRow {...submission.data} key={submission.data.id} link={link} />;
              default:
                return null;
            }
          })}
        {!!submissions && submissions.length === 0 && <NoSolutionYetTableRow />}
      </tbody>
    </Table>
  </Box>
);

SubmissionsTable.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  submissions: PropTypes.array
};

export default SubmissionsTable;
