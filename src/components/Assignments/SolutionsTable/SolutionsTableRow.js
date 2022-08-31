import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import Points from './Points';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import DeleteSolutionButtonContainer from '../../../containers/DeleteSolutionButtonContainer/DeleteSolutionButtonContainer';
import AcceptSolutionContainer from '../../../containers/AcceptSolutionContainer';
import ReviewSolutionContainer from '../../../containers/ReviewSolutionContainer';

import { DetailIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Button, { TheButtonGroup } from '../../widgets/TheButton';

import withLinks from '../../../helpers/withLinks';
import SolutionTableRowIcons from './SolutionTableRowIcons';
import styles from './SolutionsTable.less';

const showScoreAndPoints = status => status === 'done' || status === 'failed';

const SolutionsTableRow = ({
  id,
  attemptIndex,
  assignmentId,
  groupId,
  status = null,
  note,
  lastSubmission,
  maxPoints,
  bonusPoints,
  actualPoints,
  createdAt,
  accepted = false,
  reviewed = false,
  isBestSolution = false,
  runtimeEnvironment = null,
  commentsStats = null,
  permissionHints = null,
  noteMaxlen = null,
  compact = false,
  selected = false,
  showActionButtons = true,
  onSelect = null,
  links: { SOLUTION_DETAIL_URI_FACTORY },
  intl: { locale },
}) => {
  const trimmedNote = note && note.trim();
  const hasNote = Boolean(trimmedNote);
  const noteElement =
    !hasNote || noteMaxlen === null || trimmedNote.length <= noteMaxlen ? (
      trimmedNote
    ) : (
      <OverlayTrigger placement="left" overlay={<Tooltip id={id}>{trimmedNote}</Tooltip>}>
        <span>{trimmedNote.substr(0, noteMaxlen - 3).trim()}&hellip;</span>
      </OverlayTrigger>
    );
  const splitOnTwoLines = hasNote && compact;

  return (
    <tbody>
      <tr
        className={selected ? 'table-active' : onSelect ? 'clickable' : ''}
        onClick={!selected && onSelect ? () => onSelect(id) : null}>
        <td className="text-nowrap valign-middle text-bold">{attemptIndex}.</td>

        <td
          rowSpan={splitOnTwoLines ? 2 : 1}
          className={classnames({
            'valign-middle': true,
            'text-nowrap': true,
          })}>
          <SolutionTableRowIcons
            id={id}
            accepted={accepted}
            reviewed={reviewed}
            isBestSolution={isBestSolution}
            status={status}
            lastSubmission={lastSubmission}
            commentsStats={commentsStats}
          />
        </td>

        <td className="text-nowrap valign-middle">
          <DateTime unixts={createdAt} showOverlay overlayTooltipId={`datetime-${id}`} />
        </td>

        <td className="text-center text-nowrap valign-middle">
          {showScoreAndPoints(status) ? (
            <strong className="text-success">
              <FormattedNumber style="percent" value={lastSubmission.evaluation.score} />
            </strong>
          ) : (
            <span className="text-danger">-</span>
          )}
        </td>

        <td className="text-center text-nowrap valign-middle">
          {showScoreAndPoints(status) ? (
            <strong className="text-success">
              <Points points={actualPoints} bonusPoints={bonusPoints} maxPoints={maxPoints} />
            </strong>
          ) : (
            <span className="text-danger">-</span>
          )}
        </td>

        <td className="text-center text-nowrap valign-middle">
          {runtimeEnvironment ? (
            <EnvironmentsListItem runtimeEnvironment={runtimeEnvironment} longNames={!compact} />
          ) : (
            '-'
          )}
        </td>

        {!compact && (
          <td className="small" width="100%" colSpan={showActionButtons ? 1 : 2}>
            {noteElement}
          </td>
        )}

        {showActionButtons && (
          <td
            className={classnames({
              'text-right': true,
              'valign-middle': true,
              'text-nowrap': !splitOnTwoLines,
            })}
            rowSpan={splitOnTwoLines ? 2 : 1}>
            <TheButtonGroup>
              {permissionHints && permissionHints.viewDetail && (
                <OptionalTooltipWrapper
                  tooltip={<FormattedMessage id="generic.detail" defaultMessage="Detail" />}
                  hide={!compact}
                  tooltipId={`detail-${id}`}>
                  <Link to={SOLUTION_DETAIL_URI_FACTORY(assignmentId, id)}>
                    <Button size="xs" variant="secondary" disabled={selected}>
                      <DetailIcon gapRight={!compact} />
                      {!compact && <FormattedMessage id="generic.detail" defaultMessage="Detail" />}
                    </Button>
                  </Link>
                </OptionalTooltipWrapper>
              )}

              {permissionHints && permissionHints.setFlag && (
                <>
                  <AcceptSolutionContainer
                    id={id}
                    locale={locale}
                    captionAsTooltip={compact}
                    shortLabel={!compact}
                    size="xs"
                  />
                  <ReviewSolutionContainer id={id} locale={locale} captionAsTooltip={compact} size="xs" />
                </>
              )}

              {permissionHints && permissionHints.delete && (
                <DeleteSolutionButtonContainer id={id} groupId={groupId} size="xs" captionAsTooltip={compact} />
              )}
            </TheButtonGroup>
          </td>
        )}
      </tr>

      {splitOnTwoLines && (
        <tr>
          <td colSpan={4} className={styles.noteRow}>
            <b>
              <FormattedMessage id="app.solutionsTable.note" defaultMessage="Note" />:
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
  attemptIndex: PropTypes.number.isRequired,
  assignmentId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
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
  createdAt: PropTypes.number.isRequired,
  accepted: PropTypes.bool,
  reviewed: PropTypes.bool,
  isBestSolution: PropTypes.bool,
  commentsStats: PropTypes.object,
  runtimeEnvironment: PropTypes.object,
  permissionHints: PropTypes.object,
  noteMaxlen: PropTypes.number,
  compact: PropTypes.bool.isRequired,
  selected: PropTypes.bool,
  showActionButtons: PropTypes.bool,
  onSelect: PropTypes.func,
  links: PropTypes.object,
  intl: PropTypes.object,
};

export default withLinks(injectIntl(SolutionsTableRow));
