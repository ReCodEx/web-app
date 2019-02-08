import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';
import Points from './Points';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import DeleteSolutionButtonContainer from '../../../containers/DeleteSolutionButtonContainer/DeleteSolutionButtonContainer';
import CommentsIcon from './CommentsIcon';
import { SendIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';

import withLinks from '../../../helpers/withLinks';
import styles from './SolutionsTable.less';

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
  noteMaxlen = null,
  compact = false,
  links: { SOLUTION_DETAIL_URI_FACTORY },
}) => {
  const trimmedNote = note && note.trim();
  const hasNote = Boolean(trimmedNote);
  const noteElement =
    !hasNote || noteMaxlen === null || trimmedNote.length <= noteMaxlen ? (
      trimmedNote
    ) : (
      <OverlayTrigger
        placement="left"
        overlay={<Tooltip id={id}>{trimmedNote}</Tooltip>}>
        <span>{trimmedNote.substr(0, noteMaxlen - 3).trim()}&hellip;</span>
      </OverlayTrigger>
    );
  const splitOnTwoLines = hasNote && compact;

  return (
    <tbody>
      <tr>
        <td
          rowSpan={splitOnTwoLines ? 2 : 1}
          className={classnames({
            'valign-middle': true,
            'text-nowrap': !compact,
          })}>
          <AssignmentStatusIcon
            id={id}
            status={getStatusDesc(status, lastSubmission)}
            accepted={accepted}
          />
          <CommentsIcon
            id={id}
            commentsStats={commentsStats}
            gapLeft={!splitOnTwoLines}
          />
        </td>

        <td className="text-nowrap">
          <DateTime
            unixts={createdAt}
            showOverlay
            overlayTooltipId={`datetime-${id}`}
          />
        </td>

        <td className="text-center text-nowrap">
          {showScoreAndPoints(status) ? (
            <strong className="text-success">
              <FormattedNumber
                style="percent"
                value={lastSubmission.evaluation.score}
              />
            </strong>
          ) : (
            <span className="text-danger">-</span>
          )}
        </td>

        <td className="text-center text-nowrap">
          {showScoreAndPoints(status) ? (
            <strong className="text-success">
              <Points
                points={actualPoints}
                bonusPoints={bonusPoints}
                maxPoints={maxPoints}
              />
            </strong>
          ) : (
            <span className="text-danger">-</span>
          )}
        </td>

        <td className="text-center text-nowrap">
          {runtimeEnvironment ? (
            <EnvironmentsListItem
              runtimeEnvironment={runtimeEnvironment}
              longNames={!compact}
            />
          ) : (
            '-'
          )}
        </td>

        {!compact && (
          <td className="small" width="100%">
            {noteElement}
          </td>
        )}

        <td
          className={classnames({
            'text-right': true,
            'valign-middle': true,
            'text-nowrap': !splitOnTwoLines,
          })}
          rowSpan={splitOnTwoLines ? 2 : 1}>
          {permissionHints && permissionHints.viewDetail && (
            <Link
              to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, id)}
              className="btn btn-flat btn-default btn-xs">
              <SendIcon gapRight />
              <FormattedMessage id="generic.detail" defaultMessage="Detail" />
            </Link>
          )}
          {permissionHints && permissionHints.delete && (
            <DeleteSolutionButtonContainer id={id} bsSize="xs" />
          )}
        </td>
      </tr>

      {splitOnTwoLines && (
        <tr>
          <td colSpan={4} className={styles.noteRow}>
            <b>
              <FormattedMessage
                id="app.solutionsTable.note"
                defaultMessage="Note"
              />
              :
            </b>
            &nbsp;
            {noteElement}
          </td>
        </tr>
      )}
    </tbody>
  );
};

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
      points: PropTypes.number.isRequired,
    }),
  }),
  solution: PropTypes.shape({
    createdAt: PropTypes.number.isRequired,
  }),
  accepted: PropTypes.bool,
  commentsStats: PropTypes.object,
  runtimeEnvironment: PropTypes.object,
  permissionHints: PropTypes.object,
  noteMaxlen: PropTypes.number,
  compact: PropTypes.bool.isRequired,
  links: PropTypes.object,
};

export default withLinks(SolutionsTableRow);
