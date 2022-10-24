import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { withRouter } from 'react-router';

import Button from '../../widgets/TheButton';
import OptionalTooltipWrapper from '../../widgets/OptionalTooltipWrapper';
import Icon, { DeleteIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks';

const ReviewSolution = ({
  id,
  assignmentId,
  review = null,
  showAllButtons = false,
  updatePending = false,
  captionAsTooltip = false,
  size = undefined,
  openReview = null,
  closeReview = null,
  deleteReview = null,
  history: { push },
  location: { pathname },
  links: { SOLUTION_SOURCE_CODES_URI_FACTORY },
}) => {
  const reviewPageUri = SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, id);
  const isOnReviewPage = pathname === SOLUTION_SOURCE_CODES_URI_FACTORY(assignmentId, id);

  const openLabel =
    !review || !review.startedAt ? (
      <FormattedMessage id="app.reviewSolutionButtons.open" defaultMessage="Start Review" />
    ) : (
      <FormattedMessage id="app.reviewSolutionButtons.reopen" defaultMessage="Reopen Review" />
    );

  return (
    <>
      {openReview && Boolean(!review || !review.startedAt || review.closedAt) && (
        <OptionalTooltipWrapper tooltip={openLabel} hide={!captionAsTooltip}>
          <Button
            variant={!review || !review.startedAt ? 'info' : 'warning'}
            size={size}
            onClick={
              isOnReviewPage
                ? openReview
                : () => {
                    openReview().then(() => push(reviewPageUri));
                  }
            }
            disabled={updatePending}>
            <Icon icon={!review || !review.startedAt ? 'microscope' : 'person-digging'} gapRight={!captionAsTooltip} />
            {!captionAsTooltip && openLabel}
          </Button>
        </OptionalTooltipWrapper>
      )}

      {closeReview && showAllButtons && Boolean(!review || !review.startedAt) && (
        <OptionalTooltipWrapper
          tooltip={<FormattedMessage id="app.reviewSolutionButtons.markReviewed" defaultMessage="Mark as Reviewed" />}
          hide={!captionAsTooltip}>
          <Button variant="success" size={size} onClick={closeReview} disabled={updatePending}>
            <Icon icon="file-circle-check" gapRight={!captionAsTooltip} />
            {!captionAsTooltip && (
              <FormattedMessage id="app.reviewSolutionButtons.markReviewed" defaultMessage="Mark as Reviewed" />
            )}
          </Button>
        </OptionalTooltipWrapper>
      )}

      {closeReview && Boolean(review && review.startedAt && !review.closedAt) && (
        <OptionalTooltipWrapper
          tooltip={<FormattedMessage id="app.reviewSolutionButtons.close" defaultMessage="Close Review" />}
          hide={!captionAsTooltip}>
          <Button variant="success" size={size} onClick={closeReview} disabled={updatePending}>
            <Icon icon="boxes-packing" gapRight={!captionAsTooltip} />
            {!captionAsTooltip && (
              <FormattedMessage id="app.reviewSolutionButtons.close" defaultMessage="Close Review" />
            )}
          </Button>
        </OptionalTooltipWrapper>
      )}

      {deleteReview && showAllButtons && Boolean(review && review.startedAt) && (
        <Button
          variant="danger"
          size={size}
          onClick={deleteReview}
          disabled={updatePending}
          confirm={
            <FormattedMessage
              id="app.reviewSolutionButtons.deleteConfirm"
              defaultMessage="All review comments will be erased as well. Do you wish to proceed?"
            />
          }
          confirmId={id}>
          <DeleteIcon gapRight={!captionAsTooltip} />
          {<FormattedMessage id="app.reviewSolutionButtons.delete" defaultMessage="Erase Review" />}
        </Button>
      )}
    </>
  );
};

ReviewSolution.propTypes = {
  id: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  review: PropTypes.shape({
    startedAt: PropTypes.number,
    closedAt: PropTypes.number,
    issues: PropTypes.number,
  }),
  showAllButtons: PropTypes.bool,
  updatePending: PropTypes.bool,
  captionAsTooltip: PropTypes.bool,
  size: PropTypes.string,
  openReview: PropTypes.func,
  closeReview: PropTypes.func,
  deleteReview: PropTypes.func,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired,
  }).isRequired,
  links: PropTypes.object.isRequired,
};

export default withLinks(withRouter(ReviewSolution));
