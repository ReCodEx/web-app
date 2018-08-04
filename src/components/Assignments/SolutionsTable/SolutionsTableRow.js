import React from 'react';
import PropTypes from 'prop-types';
import {
  FormattedMessage,
  FormattedNumber,
  FormattedDate,
  FormattedTime
} from 'react-intl';
import { Link } from 'react-router';

import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';
import Points from './Points';
import CommentsIcon from './CommentsIcon';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import DeleteSolutionButtonContainer from '../../../containers/DeleteSolutionButtonContainer/DeleteSolutionButtonContainer';
import { SendIcon } from '../../icons';

import withLinks from '../../../helpers/withLinks';

const showScoreAndPoints = status => status === 'done' || status === 'failed';

const getStatusDesc = (status, lastSubmission) => {
  if (status === null) {
    status = 'work-in-progress';
  }
  return status === 'work-in-progress' && !lastSubmission
    ? 'missing-submission'
    : status;
};

const SolutionsTableRow = ({
  id,
  assignmentId,
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
  permissionHints = null,
  renderButtons,
  links: { SOLUTION_DETAIL_URI_FACTORY }
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
        ? <EnvironmentsListItem runtimeEnvironment={runtimeEnvironment} />
        : '-'}
    </td>
    <td>
      {note}
    </td>
    <td className="text-right">
      {permissionHints &&
        permissionHints.viewDetail &&
        <Link
          to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, id)}
          className="btn btn-flat btn-default btn-xs"
        >
          <SendIcon gapRight />
          <FormattedMessage id="generic.detail" defaultMessage="Detail" />
        </Link>}
      {permissionHints &&
        permissionHints.delete &&
        <DeleteSolutionButtonContainer id={id} bsSize="xs" />}
    </td>
  </tr>;

SolutionsTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
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
  permissionHints: PropTypes.object,
  renderButtons: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(SolutionsTableRow);
