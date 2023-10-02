import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import SolutionStatusIcon from '../../Solutions/SolutionStatusIcon';
import SolutionReviewIcon from '../../Solutions/SolutionReviewIcon';
import CommentsIcon from './CommentsIcon';
import { PlagiarismIcon } from '../../icons';

import withLinks from '../../../helpers/withLinks';

const SolutionTableRowIcons = ({
  id,
  assignmentId,
  solution,
  isReviewer = false,
  links: { SOLUTION_PLAGIARISMS_URI_FACTORY },
}) => {
  const { review = null, commentsStats = null, plagiarism = null } = solution;

  return (
    <>
      <SolutionStatusIcon id={id} solution={solution} />

      {review && <SolutionReviewIcon id={`review-${id}`} review={review} isReviewer={isReviewer} gapLeft />}

      {Boolean(plagiarism) && isReviewer && (
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
    plagiarism: PropTypes.string,
  }).isRequired,
  isReviewer: PropTypes.bool,
  links: PropTypes.object,
};

export default withLinks(SolutionTableRowIcons);
