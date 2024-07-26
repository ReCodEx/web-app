import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import SolutionStatusIcon from '../../Solutions/SolutionStatusIcon';
import SolutionReviewIcon from '../../Solutions/SolutionReviewIcon';
import CommentsIcon from './CommentsIcon.js';
import { PlagiarismIcon, ReviewIcon } from '../../icons';

import withLinks from '../../../helpers/withLinks.js';

const SolutionTableRowIcons = ({
  id,
  assignmentId,
  solution,
  permissionHints = {},
  links: { SOLUTION_PLAGIARISMS_URI_FACTORY },
}) => {
  const { review = null, reviewRequest = false, commentsStats = null, plagiarism = null } = solution;

  return (
    <>
      <SolutionStatusIcon id={id} solution={solution} />

      {review ? (
        <SolutionReviewIcon id={`review-${id}`} review={review} isReviewer={permissionHints.review || false} gapLeft />
      ) : (
        reviewRequest && (
          <OverlayTrigger
            placement="bottom"
            overlay={
              <Tooltip id={`reviewRequest-${id}`}>
                <FormattedMessage
                  id="app.solution.reviewRequestNote"
                  defaultMessage="The student has requested a code review for this solution."
                />
              </Tooltip>
            }>
            <ReviewIcon
              reviewRequest
              className="text-primary fa-bounce"
              style={{ '--fa-animation-duration': '2s' }}
              transform="down-3"
              gapLeft
            />
          </OverlayTrigger>
        )
      )}

      {Boolean(plagiarism) && permissionHints.viewDetectedPlagiarisms && (
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
};

SolutionTableRowIcons.propTypes = {
  id: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  solution: PropTypes.PropTypes.shape({
    commentsStats: PropTypes.object,
    review: PropTypes.shape({
      startedAt: PropTypes.number,
      closedAt: PropTypes.number,
      issues: PropTypes.number,
    }),
    reviewRequest: PropTypes.bool,
    plagiarism: PropTypes.string,
  }).isRequired,
  permissionHints: PropTypes.PropTypes.shape({
    review: PropTypes.bool,
    viewDetectedPlagiarisms: PropTypes.bool,
  }),
  links: PropTypes.object,
};

export default withLinks(SolutionTableRowIcons);
