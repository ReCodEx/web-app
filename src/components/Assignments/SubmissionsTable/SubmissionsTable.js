import React, { PropTypes } from 'react';
import { List } from 'immutable';

import { Table } from 'react-bootstrap';
import Box from '../../AdminLTE/Box';
import { SUBMISSION_DETAIL_URI_FACTORY } from '../../../links';
import { isReady, hasFailed, isLoading } from '../../../redux/helpers/resourceManager';

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
    <Table responsive>
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
        {!!submissions && submissions.size > 0 &&
          submissions.map((submission, i) => {
            if (hasFailed(submission)) {
              return <FailedLoadingSubmissionTableRow key={i} />;
            } else if (isLoading(submission)) {
              return <LoadingSubmissionTableRow key={i} />;
            }

            const data = submission.get('data').toJS();
            const id = data.id;
            const link = SUBMISSION_DETAIL_URI_FACTORY(assignmentId, id);

            switch (data.evaluationStatus) {
              case 'done':
                return <SuccessfulSubmissionTableRow {...data} key={id} link={link} />;
              case 'failed':
                return <FailedSubmissionTableRow {...data} key={id} link={link} />;
              case 'work-in-progress':
                return <NotEvaluatedSubmissionTableRow {...data} key={id} link={link} />;
              case 'evaluation-failed':
                return <EvaluationFailedTableRow {...data} key={id} link={link} />;
              default:
                return null;
            }
          })}
        {!!submissions && submissions.size === 0 && <NoSolutionYetTableRow />}
      </tbody>
    </Table>
  </Box>
);

SubmissionsTable.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  submissions: PropTypes.instanceOf(List)
};

export default SubmissionsTable;
