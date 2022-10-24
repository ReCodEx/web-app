import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import ReviewSolution from '../../components/buttons/ReviewSolution';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import { setSolutionReviewState, deleteSolutionReview } from '../../redux/modules/solutionReviews';
import { getSolution } from '../../redux/selectors/solutions';
import { isSolutionReviewUpdatePending } from '../../redux/selectors/solutionReviews';

const ReviewSolutionContainer = ({ id, solution, updatePending, openReview, closeReview, deleteReview, ...props }) => {
  return (
    <ResourceRenderer resource={solution}>
      {solution => (
        <ReviewSolution
          {...props}
          id={id}
          assignmentId={solution.assignmentId}
          review={solution.review}
          updatePending={updatePending}
          openReview={openReview}
          closeReview={closeReview}
          deleteReview={deleteReview}
        />
      )}
    </ResourceRenderer>
  );
};

ReviewSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  solution: ImmutablePropTypes.map,
  updatePending: PropTypes.bool,
  openReview: PropTypes.func.isRequired,
  closeReview: PropTypes.func.isRequired,
  deleteReview: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { id }) => ({
  solution: getSolution(state, id),
  updatePending: isSolutionReviewUpdatePending(state, id),
});

const mapDispatchToProps = (dispatch, { id }) => ({
  openReview: () => dispatch(setSolutionReviewState(id, false)),
  closeReview: () => dispatch(setSolutionReviewState(id, true)),
  deleteReview: () => dispatch(deleteSolutionReview(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReviewSolutionContainer);
