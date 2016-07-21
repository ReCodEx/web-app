import React, { PropTypes } from 'react';

import { Link } from 'react-router';
import { Table } from 'react-bootstrap';
import { FormattedNumber, FormattedDate, FormattedTime } from 'react-intl';
import Box from '../Box';
import AssignmentStatusIcon from '../AssignmentStatusIcon';
import { SUBMISSION_DETAIL_URI_FACTORY } from '../../links';

const SubmissionsTable = ({
  assignmentId,
  submissions
}) => (
  <Box title='Odevzdaná řešení'>
    <Table>
      <thead>
        <tr>
          <th></th>
          <th>Datum odevzdání</th>
          <th className='text-center'>Úspěšnost řešení</th>
          <th>Poznámka</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {submissions.map(submission => (
          <tr key={submission.id}>
            <td><AssignmentStatusIcon status={submission.percent === 1 ? 'done' : 'failed'} /></td>
            <td>
              <FormattedDate value={submission.date * 1000} />&nbsp;<FormattedTime value={submission.date * 1000} />
            </td>
            <td className='text-center'>
              {submission.percent === 1
                ? <strong className='text-success'><FormattedNumber style='percent' value={submission.percent} /></strong>
                : <FormattedNumber style='percent' value={submission.percent} />}
            </td>
            <td>
              {submission.description}
            </td>
            <td className='text-right'>
              <Link to={SUBMISSION_DETAIL_URI_FACTORY(assignmentId, submission.id)} className='btn btn-flat btn-default btn-xs'>Zobrazit podrobnosti</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Box>
);

SubmissionsTable.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  submissions: PropTypes.array.isRequired
};

export default SubmissionsTable;
