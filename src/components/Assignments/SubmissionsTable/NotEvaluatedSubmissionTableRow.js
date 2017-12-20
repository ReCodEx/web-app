import React from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { Link } from 'react-router';
import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';

const NotEvaluatedSubmissionTableRow = ({
  link,
  note,
  solution: { createdAt },
  lastSubmission,
  runtimeEnvironment = null
}) =>
  <tr>
    <td>
      <AssignmentStatusIcon
        id={link}
        status={lastSubmission ? 'work-in-progress' : 'missing-submission'}
      />
    </td>
    <td className="text-nowrap">
      <FormattedDate value={createdAt * 1000} />
      &nbsp;
      <FormattedTime value={createdAt * 1000} />
    </td>
    <td className="text-center text-nowrap">-</td>
    <td className="text-center text-nowrap">- / -</td>
    <td className="text-center text-nowrap">
      {runtimeEnvironment ? runtimeEnvironment.name : '-'}
    </td>
    <td>
      {note}
    </td>
    <td className="text-right">
      <Link to={link} className="btn btn-flat btn-default btn-xs">
        <FormattedMessage
          id="app.submissionsTable.showDetails"
          defaultMessage="Show details"
        />
      </Link>
    </td>
  </tr>;

NotEvaluatedSubmissionTableRow.propTypes = {
  link: PropTypes.string.isRequired,
  note: PropTypes.string.isRequired,
  solution: PropTypes.shape({
    createdAt: PropTypes.number.isRequired
  }).isRequired,
  lastSubmission: PropTypes.object,
  runtimeEnvironment: PropTypes.object
};

export default NotEvaluatedSubmissionTableRow;
