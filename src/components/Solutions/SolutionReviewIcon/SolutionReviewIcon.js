import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { ReviewIcon } from '../../icons';
import DateTime from '../../widgets/DateTime';

const SolutionReviewIcon = ({ id, review, isReviewer = false, placement = 'bottom', className = '', ...props }) => {
  if (!review.startedAt) {
    return null;
  }

  const pendinColorClass = isReviewer ? 'text-danger fa-beat' : 'text-body-secondary';
  const closedColorClass = review.issues > 0 ? 'text-warning' : 'text-success';
  const colorClass = !review.closedAt ? pendinColorClass : `${closedColorClass} half-gray`;

  return (
    <ReviewIcon
      {...props}
      review={review}
      className={`${className} ${colorClass}`}
      tooltipId={id}
      tooltipPlacement={placement}
      tooltip={
        !review.closedAt ? (
          <FormattedMessage
            id="app.solutionReviewIcon.tooltip.startedAt"
            defaultMessage="The review was started at {started} and has not been closed yet."
            values={{ started: <DateTime unixts={review.startedAt} /> }}
          />
        ) : (
          <>
            <FormattedMessage
              id="app.solutionReviewIcon.tooltip.closedAt"
              defaultMessage="The review was closed at {closed}, the comments are available on the submitted files page."
              values={{ closed: <DateTime unixts={review.closedAt} /> }}
            />{' '}
            {review.issues > 0 ? (
              <FormattedMessage
                id="app.solutionReviewIcon.tooltip.issues"
                defaultMessage="The reviewer created {issues} {issues, plural, one {issue} other {issues}}, please, fix {issues, plural, one {it} other {them}} in the next solution."
                values={{ issues: review.issues }}
              />
            ) : (
              <FormattedMessage id="app.solutionReviewIcon.tooltip.noIssues" defaultMessage="No issues were created." />
            )}
          </>
        )
      }
    />
  );
};

SolutionReviewIcon.propTypes = {
  id: PropTypes.string.isRequired,
  review: PropTypes.shape({
    startedAt: PropTypes.number,
    closedAt: PropTypes.number,
    issues: PropTypes.number,
  }).isRequired,
  placement: PropTypes.string,
  className: PropTypes.string,
  isReviewer: PropTypes.bool,
};

export default SolutionReviewIcon;
