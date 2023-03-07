import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import SolutionReviewIcon from '../../Solutions/SolutionReviewIcon';
import AssignmentStatusIcon, { getStatusDesc } from '../Assignment/AssignmentStatusIcon';
import CommentsIcon from './CommentsIcon';
import { PlagiarismIcon } from '../../icons';

const SolutionTableRowIcons = ({
  id,
  accepted,
  review = null,
  isBestSolution,
  status,
  lastSubmission,
  commentsStats = null,
  isReviewer = false,
  plagiarism = false,
}) => (
  <>
    <AssignmentStatusIcon
      id={id}
      status={getStatusDesc(status, lastSubmission)}
      accepted={accepted}
      isBestSolution={isBestSolution}
    />

    {review && <SolutionReviewIcon id={`review-${id}`} review={review} isReviewer={isReviewer} gapLeft />}

    {plagiarism && isReviewer && (
      <OverlayTrigger
        placement="right"
        overlay={
          <Tooltip id={id}>
            <FormattedMessage
              id="app.solutionsTable.icons.suspectedPlagiarism"
              defaultMessage="Suspected plagiarism (similarities with other solutions were found)"
            />
          </Tooltip>
        }>
        <PlagiarismIcon className="text-danger fa-beat" gapLeft />
      </OverlayTrigger>
    )}

    <CommentsIcon id={id} commentsStats={commentsStats} gapLeft />
  </>
);

SolutionTableRowIcons.propTypes = {
  id: PropTypes.string.isRequired,
  commentsStats: PropTypes.object,
  accepted: PropTypes.bool.isRequired,
  review: PropTypes.shape({
    startedAt: PropTypes.number,
    closedAt: PropTypes.number,
    issues: PropTypes.number,
  }),
  isBestSolution: PropTypes.bool.isRequired,
  status: PropTypes.string,
  lastSubmission: PropTypes.shape({
    evaluation: PropTypes.shape({
      score: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired,
    }),
  }),
  isReviewer: PropTypes.bool,
  plagiarism: PropTypes.bool,
};

export default SolutionTableRowIcons;
