import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';

const NotEvaluatedSubmissionTableRow = ({
  link,
  note,
  solution: { createdAt }
}) =>
  <tr>
    <td>
      <AssignmentStatusIcon id={link} status="work-in-progress" />
    </td>
    <td>
      <FormattedDate value={createdAt * 1000} />
      &nbsp;
      <FormattedTime value={createdAt * 1000} />
    </td>
    <td className="text-center">-</td>
    <td className="text-center">- / -</td>
    <td>
      {note}
    </td>
    <td className="text-right">
      <Link to={link} className="btn btn-flat btn-default btn-xs">
        <FormattedMessage
          id="app.submissionsTable.findOutResult"
          defaultMessage="Find out results of evaluation"
        />
      </Link>
    </td>
  </tr>;

NotEvaluatedSubmissionTableRow.propTypes = {
  link: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
  solution: PropTypes.shape({
    createdAt: PropTypes.number.isRequired
  }).isRequired
};

export default NotEvaluatedSubmissionTableRow;
