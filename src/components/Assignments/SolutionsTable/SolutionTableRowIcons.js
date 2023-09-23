import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import SolutionReviewIcon from '../../Solutions/SolutionReviewIcon';
import AssignmentStatusIcon from '../Assignment/AssignmentStatusIcon';
import CommentsIcon from './CommentsIcon';
import { PlagiarismIcon } from '../../icons';

import withLinks from '../../../helpers/withLinks';

const SolutionTableRowIcons = ({
  id,
  assignmentId,
  accepted,
  review = null,
  isBestSolution,
  lastSubmission,
  commentsStats = null,
  isReviewer = false,
  plagiarism = false,
  links: { SOLUTION_PLAGIARISMS_URI_FACTORY },
}) => (
  <>
    <AssignmentStatusIcon id={id} submission={lastSubmission} accepted={accepted} isBestSolution={isBestSolution} />

    {review && <SolutionReviewIcon id={`review-${id}`} review={review} isReviewer={isReviewer} gapLeft />}

    {plagiarism && isReviewer && (
      <Link to={SOLUTION_PLAGIARISMS_URI_FACTORY(assignmentId, id)}>
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
      </Link>
    )}

    <CommentsIcon id={id} commentsStats={commentsStats} gapLeft />
  </>
);

SolutionTableRowIcons.propTypes = {
  id: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  commentsStats: PropTypes.object,
  accepted: PropTypes.bool.isRequired,
  review: PropTypes.shape({
    startedAt: PropTypes.number,
    closedAt: PropTypes.number,
    issues: PropTypes.number,
  }),
  isBestSolution: PropTypes.bool.isRequired,
  lastSubmission: PropTypes.shape({
    evaluation: PropTypes.shape({
      score: PropTypes.number.isRequired,
      points: PropTypes.number.isRequired,
    }),
  }),
  isReviewer: PropTypes.bool,
  plagiarism: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(SolutionTableRowIcons);
