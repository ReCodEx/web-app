import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';

import withLinks from '../../../helpers/withLinks';

import ActionButton from './ActionButton';
import ActionDropdown from './ActionDropdown';

/**
 * Action templates containing basic parameters: label, short (label), icon (name), variant (success if missing),
 * and confirm (confirm yes/no message for a popover; no confirmation required if missing)
 */
const actionsTemplates = {
  accept: {
    short: <FormattedMessage id="app.acceptSolution.notAcceptedShort" defaultMessage="Accept" />,
    label: <FormattedMessage id="app.acceptSolution.notAccepted" defaultMessage="Accept as Final" />,
    icon: ['far', 'check-circle'],
    pending: 'acceptPending',
  },
  unaccept: {
    short: <FormattedMessage id="app.acceptSolution.acceptedShort" defaultMessage="Revoke" />,
    label: <FormattedMessage id="app.acceptSolution.accepted" defaultMessage="Revoke as Final" />,
    icon: ['far', 'circle-xmark'],
    variant: 'warning',
    pending: 'acceptPending',
  },

  // review actions
  open: {
    label: <FormattedMessage id="app.reviewSolutionButtons.open" defaultMessage="Start Review" />,
    icon: 'microscope',
    variant: 'info',
  },
  reopen: {
    label: <FormattedMessage id="app.reviewSolutionButtons.reopen" defaultMessage="Reopen Review" />,
    icon: 'person-digging',
    variant: 'warning',
  },
  openClose: {
    label: <FormattedMessage id="app.reviewSolutionButtons.markReviewed" defaultMessage="Mark as Reviewed" />,
    icon: 'file-circle-check',
  },
  close: {
    label: <FormattedMessage id="app.reviewSolutionButtons.close" defaultMessage="Close Review" />,
    icon: 'boxes-packing',
  },
  delete: {
    label: <FormattedMessage id="app.reviewSolutionButtons.delete" defaultMessage="Erase Review" />,
    icon: 'trash',
    variant: 'danger',
    confirm: (
      <FormattedMessage
        id="app.reviewSolutionButtons.deleteConfirm"
        defaultMessage="All review comments will be erased as well. Do you wish to proceed?"
      />
    ),
  },
};

const knownActions = ['accept', 'unaccept', 'open', 'reopen', 'openClose', 'close', 'delete'];

const SolutionActions = ({
  id,
  solution,
  acceptPending = false,
  showAllButtons = false,
  updatePending = false,
  captionAsTooltip = false,
  size = undefined,
  dropdown = false,
  setAccepted = null,
  setReviewState = null,
  deleteReview = null,
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

  const reviewPageUri = SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, id);
  const isOnReviewPage = pathname === SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, id);

  const actionHandlers = {
    accept: !accepted && setAccepted && (() => setAccepted(true)),
    unaccept: accepted && setAccepted && (() => setAccepted(false)),
    open: setReviewState && (!review || !review.startedAt) && (() => setReviewState(false)),
    reopen: setReviewState && review && review.closedAt && (() => setReviewState(false)),
    openClose: setReviewState && (!review || !review.startedAt) && showAllButtons && (() => setReviewState(true)),
    close: setReviewState && review && review.startedAt && !review.closedAt && (() => setReviewState(true)),
    delete: showAllButtons && review && review.startedAt && deleteReview,
  };

  if (!isOnReviewPage) {
    actionHandlers.open = actionHandlers.open && (() => actionHandlers.open().then(() => push(reviewPageUri)));
    actionHandlers.reopen = actionHandlers.reopen && (() => actionHandlers.reopen().then(() => push(reviewPageUri)));
  }

  const actions = knownActions
    .filter(a => actionHandlers[a])
    .map(a => ({
      ...actionsTemplates[a],
      handler: actionHandlers[a],
      pending: actionsTemplates[a].pending === 'acceptPending' ? acceptPending : updatePending,
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
    review: PropTypes.shape({
      startedAt: PropTypes.number,
      closedAt: PropTypes.number,
      issues: PropTypes.number,
    }),
    permissionHints: PropTypes.object,
  }),
  showAllButtons: PropTypes.bool,
  acceptPending: PropTypes.bool,
  updatePending: PropTypes.bool,
  captionAsTooltip: PropTypes.bool,
  size: PropTypes.string,
  dropdown: PropTypes.bool,
  setAccepted: PropTypes.func,
  setReviewState: PropTypes.func,
  deleteReview: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(withRouter(SolutionActions));
