import React from 'react';
import PropTypes from 'prop-types';
import { FormattedNumber, FormattedDate, FormattedTime } from 'react-intl';

import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';
import Points from './Points';
import CommentsIcon from './CommentsIcon';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';

const showScoreAndPoints = status => status === 'done' || status === 'failed';

const getStatusDesc = (status, lastSubmission) => {
  if (status === null) {
    status = 'work-in-progress';
  }
  return status === 'work-in-progress' && !lastSubmission
    ? 'missing-submission'
    : status;
};

const SubmissionTableRow = ({
  id,
  status = null,
  note,
  lastSubmission,
  maxPoints,
  bonusPoints,
  actualPoints,
  solution: { createdAt },
  accepted = false,
  runtimeEnvironment = null,
  commentsStats = null,
  renderButtons
}) =>
  <tr>
    <td>
      <AssignmentStatusIcon
        id={id}
        status={getStatusDesc(status, lastSubmission)}
        accepted={accepted}
      />
    </td>
    <td>
      <CommentsIcon id={id} commentsStats={commentsStats} />
    </td>
    <td className="text-nowrap">
      <FormattedDate value={createdAt * 1000} />
      &nbsp;
      <FormattedTime value={createdAt * 1000} />
    </td>
    <td className="text-center text-nowrap">
      {showScoreAndPoints(status)
        ? <strong className="text-success">
            <FormattedNumber
              style="percent"
              value={lastSubmission.evaluation.score}
            />
          </strong>
        : <span className="text-danger">-</span>}
    </td>
    <td className="text-center text-nowrap">
      {showScoreAndPoints(status)
        ? <strong className="text-success">
            <Points
              points={actualPoints}
              bonusPoints={bonusPoints}
              maxPoints={maxPoints}
            />
          </strong>
        : <span className="text-danger">-</span>}
    </td>
    <td className="text-center text-nowrap">
      {runtimeEnvironment
        ? <EnvironmentsListItem
            runtimeEnvironment={runtimeEnvironment}
            longNames={true}
          />
        : '-'}
    </td>
    <td>
      {note}
    </td>
    <td className="text-right">
      {renderButtons && renderButtons(id)}
    </td>
  </tr>;

SubmissionTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  status: PropTypes.string,
  note: PropTypes.any.isRequired,
  maxPoints: PropTypes.number.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  actualPoints: PropTypes.number,
  lastSubmission: PropTypes.shape({
    evaluation: PropTypes.shape({
      score: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired
    })
  }),
  solution: PropTypes.shape({
    createdAt: PropTypes.number.isRequired
  }),
  accepted: PropTypes.bool,
  commentsStats: PropTypes.object,
  runtimeEnvironment: PropTypes.object,
  renderButtons: PropTypes.func
};

export default SubmissionTableRow;
