import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import classnames from 'classnames';

import Points from './Points.js';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem.js';
import DeleteSolutionButtonContainer from '../../../containers/DeleteSolutionButtonContainer';
import SolutionActionsContainer from '../../../containers/SolutionActionsContainer';

import { DetailIcon, CodeFileIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Button, { TheButtonGroup } from '../../widgets/TheButton';

import withLinks from '../../../helpers/withLinks.js';
import SolutionTableRowIcons from './SolutionTableRowIcons.js';
import * as styles from './SolutionsTable.less';

const SolutionsTableRow = ({
  id,
  groupId,
  assignmentId,
  solution,
  runtimeEnvironment = null,
  noteMaxlen = null,
  compact = false,
  selected = false,
  highlighted = false,
  showActionButtons = true,
  doubleclickAction = null,
  onSelect = null,
  links: { SOLUTION_DETAIL_URI_FACTORY, SOLUTION_SOURCE_CODES_URI_FACTORY },
}) => {
  const {
    attemptIndex,
    note,
    lastSubmission,
    maxPoints,
    bonusPoints,
    actualPoints,
    createdAt,
    permissionHints = null,
  } = solution;

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
    <tbody
      onClick={!selected && onSelect ? () => onSelect(id) : null}
      onDoubleClick={
        !onSelect && doubleclickAction && (() => doubleclickAction(SOLUTION_DETAIL_URI_FACTORY(assignmentId, id)))
      }>
      <tr
        className={classnames({
          'table-primary': selected,
          clickable: !selected && onSelect,
          'table-warning': highlighted,
        })}>
        <td className="text-nowrap valign-middle text-bold" rowSpan={splitOnTwoLines ? 2 : 1}>
          {attemptIndex}.
        </td>

        <td
          rowSpan={splitOnTwoLines ? 2 : 1}
          className={classnames({
            'valign-middle': true,
            'text-nowrap': true,
          })}>
          <SolutionTableRowIcons
            id={id}
            assignmentId={assignmentId}
            solution={solution}
            permissionHints={permissionHints}
          />
        </td>

        <td className="text-nowrap valign-middle">
          <DateTime unixts={createdAt} showOverlay overlayTooltipId={`datetime-${id}`} />
        </td>

        <td className="text-center text-nowrap valign-middle">
          {lastSubmission.evaluation ? (
            <strong className="text-success">
              <FormattedNumber style="percent" value={lastSubmission.evaluation.score} />
            </strong>
          ) : (
            <span className="text-danger">-</span>
          )}
        </td>

        <td className="text-center text-nowrap valign-middle">
          {lastSubmission.evaluation ? (
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
          <td className="text-right valign-middle text-nowrap" rowSpan={splitOnTwoLines ? 2 : 1}>
            {!selected && (
              <TheButtonGroup>
                {permissionHints && permissionHints.viewDetail && (
                  <>
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

                    <OptionalTooltipWrapper
                      tooltip={<FormattedMessage id="app.navigation.solutionFiles" defaultMessage="Submitted Files" />}
                      hide={!compact}
                      tooltipId={`codes-${id}`}>
                      <Link to={SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, id)}>
                        <Button size="xs" variant="primary" disabled={selected}>
                          <CodeFileIcon fixedWidth gapRight={!compact} />
                          {!compact && <FormattedMessage id="generic.files" defaultMessage="Files" />}
                        </Button>
                      </Link>
                    </OptionalTooltipWrapper>
                  </>
                )}

                {permissionHints && (permissionHints.setFlag || permissionHints.review) && (
                  <SolutionActionsContainer id={id} captionAsTooltip={compact} showAllButtons dropdown />
                )}

                {permissionHints && permissionHints.delete && (
                  <DeleteSolutionButtonContainer id={id} groupId={groupId} size="xs" captionAsTooltip={compact} />
                )}
              </TheButtonGroup>
            )}
          </td>
        )}
      </tr>

      {splitOnTwoLines && (
        <tr
          className={classnames({
            'table-primary': selected,
            clickable: !selected && onSelect,
            'table-warning': highlighted,
          })}>
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
  solution: PropTypes.shape({
    attemptIndex: PropTypes.number.isRequired,
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
    permissionHints: PropTypes.object,
  }).isRequired,
  assignmentId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  runtimeEnvironment: PropTypes.object,
  noteMaxlen: PropTypes.number,
  compact: PropTypes.bool.isRequired,
  selected: PropTypes.bool,
  highlighted: PropTypes.bool,
  showActionButtons: PropTypes.bool,
  doubleclickAction: PropTypes.func,
  onSelect: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(SolutionsTableRow);
