import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';

import withLinks from '../../../helpers/withLinks';
import { safeGet } from '../../../helpers/common';

import ActionButton from './ActionButton';
import ActionDropdown from './ActionDropdown';

/**
 * Action templates containing basic parameters: label, short (label), icon (name), variant (success if missing),
 * and confirm (confirm yes/no message for a popover; no confirmation required if missing)
 */
const actionsTemplates = {
  accept: {
    short: <FormattedMessage id="app.solution.actions.accept" defaultMessage="Accept" />,
    label: <FormattedMessage id="app.solution.actions.acceptLong" defaultMessage="Accept as Final" />,
    icon: ['far', 'check-circle'],
    pending: 'acceptPending',
  },
  unaccept: {
    short: <FormattedMessage id="app.solution.actions.revokeAccept" defaultMessage="Revoke" />,
    label: <FormattedMessage id="app.solution.actions.revokeAcceptLong" defaultMessage="Revoke as Final" />,
    icon: ['far', 'circle-xmark'],
    variant: 'warning',
    pending: 'acceptPending',
  },

  // point actions
  zeroPoints: {
    label: <FormattedMessage id="app.solution.actions.points.zero" defaultMessage="Zero Points" />,
    icon: 'battery-empty',
    variant: 'danger',
    pending: 'pointsPending',
  },
  fullPoints: {
    label: <FormattedMessage id="app.solution.actions.points.full" defaultMessage="Full Points" />,
    icon: 'battery-full',
    pending: 'pointsPending',
  },
  clearPoints: {
    label: <FormattedMessage id="app.solution.actions.points.clearOverride" defaultMessage="Clear Points Override" />,
    icon: 'rotate-left',
    variant: 'warning',
    pending: 'pointsPending',
  },

  // review actions
  open: {
    label: <FormattedMessage id="app.solution.actions.review.open" defaultMessage="Start Review" />,
    icon: 'microscope',
    variant: 'info',
    pending: 'updatePending',
  },
  reopen: {
    label: <FormattedMessage id="app.solution.actions.review.reopen" defaultMessage="Reopen Review" />,
    icon: 'person-digging',
    variant: 'warning',
    pending: 'updatePending',
  },
  openClose: {
    label: <FormattedMessage id="app.solution.actions.review.markReviewed" defaultMessage="Mark as Reviewed" />,
    icon: 'file-circle-check',
    pending: 'updatePending',
  },
  close: {
    label: <FormattedMessage id="app.solution.actions.review.close" defaultMessage="Close Review" />,
    icon: 'boxes-packing',
    pending: 'updatePending',
  },
  delete: {
    label: <FormattedMessage id="app.solution.actions.review.delete" defaultMessage="Erase Review" />,
    icon: 'trash',
    variant: 'danger',
    pending: 'updatePending',
    confirm: (
      <FormattedMessage
        id="app.reviewSolutionButtons.deleteConfirm"
        defaultMessage="All review comments will be erased as well. Do you wish to proceed?"
      />
    ),
  },
};

const knownActions = [
  'accept',
  'unaccept',
  'zeroPoints',
  'fullPoints',
  'clearPoints',
  'open',
  'reopen',
  'openClose',
  'close',
  'delete',
];

const SolutionActions = ({
  id,
  solution,
  assignment,
  pointsPending = false,
  acceptPending = false,
  showAllButtons = false,
  updatePending = false,
  captionAsTooltip = false,
  size = undefined,
  dropdown = false,
  setAccepted = null,
  setReviewState = null,
  deleteReview = null,
  setPoints = null,
  history: { push },
  location: { pathname },
  links: { SOLUTION_SOURCE_CODES_URI_FACTORY },
}) => {
  const review = solution && solution.review;
  const assignmentId = solution && solution.assignmentId;
  const accepted = solution && solution.accepted;
  const permissionHints = solution && solution.permissionHints;
  if (!permissionHints.setFlag) {
    setAccepted = null;
  }
  if (!permissionHints.review) {
    setReviewState = deleteReview = null;
  }
  if (!permissionHints.setBonusPoints || !showAllButtons) {
    setPoints = null;
  }

  const reviewPageUri = SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, id);
  const isOnReviewPage = pathname === SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, id);

  const bonusPoints = solution.bonusPoints;
  const points = solution.overriddenPoints !== null ? solution.overriddenPoints : solution.actualPoints;
  const evalPoints = safeGet(solution, ['lastSubmission', 'evaluation', 'points']);
  const maxPoints = assignment.maxPointsBeforeFirstDeadline;

  const openReview = setReviewState && (() => setReviewState(false));
  const actionHandlers = {
    accept: !accepted && setAccepted && (() => setAccepted(true)),
    unaccept: accepted && setAccepted && (() => setAccepted(false)),
    zeroPoints:
      setPoints && points !== 0 && evalPoints !== 0 && (() => setPoints({ bonusPoints, overriddenPoints: 0 })),
    fullPoints:
      setPoints &&
      points < maxPoints &&
      evalPoints !== maxPoints &&
      (() => setPoints({ bonusPoints, overriddenPoints: maxPoints })),
    clearPoints:
      setPoints && solution.overriddenPoints !== null && (() => setPoints({ bonusPoints, overriddenPoints: null })),
    open:
      openReview &&
      (!review || !review.startedAt) &&
      (isOnReviewPage ? openReview : () => openReview().then(() => push(reviewPageUri))),
    reopen:
      openReview &&
      review &&
      review.closedAt &&
      (isOnReviewPage ? openReview : () => openReview().then(() => push(reviewPageUri))),
    openClose: setReviewState && (!review || !review.startedAt) && showAllButtons && (() => setReviewState(true)),
    close: setReviewState && review && review.startedAt && !review.closedAt && (() => setReviewState(true)),
    delete: showAllButtons && review && review.startedAt && deleteReview,
  };

  const pendingIndicators = { acceptPending, updatePending, pointsPending };
  const actions = knownActions
    .filter(a => actionHandlers[a])
    .map(a => ({
      ...actionsTemplates[a],
      handler: actionHandlers[a],
      pending: pendingIndicators[actionsTemplates[a].pending] || false,
    }));

  return dropdown ? (
    <ActionDropdown id={id} actions={actions} captionAsTooltip={captionAsTooltip} />
  ) : (
    actions.map(action => (
      <ActionButton
        key={action.icon}
        id={id}
        variant={action.variant}
        icon={action.icon}
        label={action.label}
        shortLabel={action.short || action.label}
        confirm={action.confirm}
        pending={action.pending}
        captionAsTooltip={captionAsTooltip}
        size={size}
        onClick={action.handler}
      />
    ))
  );
};

SolutionActions.propTypes = {
  id: PropTypes.string.isRequired,
  solution: PropTypes.shape({
    accepted: PropTypes.bool,
    assignmentId: PropTypes.string.isRequired,
    bonusPoints: PropTypes.number,
    actualPoints: PropTypes.number,
    overriddenPoints: PropTypes.number,
    review: PropTypes.shape({
      startedAt: PropTypes.number,
      closedAt: PropTypes.number,
      issues: PropTypes.number,
    }),
    permissionHints: PropTypes.object,
  }),
  assignment: PropTypes.shape({
    maxPointsBeforeFirstDeadline: PropTypes.number,
  }),
  showAllButtons: PropTypes.bool,
  pointsPending: PropTypes.bool,
  acceptPending: PropTypes.bool,
  updatePending: PropTypes.bool,
  captionAsTooltip: PropTypes.bool,
  size: PropTypes.string,
  dropdown: PropTypes.bool,
  setAccepted: PropTypes.func,
  setReviewState: PropTypes.func,
  deleteReview: PropTypes.func,
  setPoints: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(withRouter(SolutionActions));
