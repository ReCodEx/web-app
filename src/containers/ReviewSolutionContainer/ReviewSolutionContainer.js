import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ReviewSolution from '../../components/buttons/ReviewSolution';
import { setSolutionFlag } from '../../redux/modules/solutions';
import { isReviewed, isSetFlagPending } from '../../redux/selectors/solutions';

const ReviewSolutionContainer = ({ reviewed, reviewPending, setReviewed, unsetReviewed, ...props }) => {
  return (
    <ReviewSolution
      reviewed={reviewed}
      reviewPending={reviewPending}
      setReviewed={setReviewed}
      unsetReviewed={unsetReviewed}
      {...props}
    />
  );
};

ReviewSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  reviewed: PropTypes.bool.isRequired,
  reviewPending: PropTypes.bool.isRequired,
  setReviewed: PropTypes.func.isRequired,
  unsetReviewed: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { id }) => ({
  reviewed: isReviewed(state, id),
  reviewPending: isSetFlagPending(state, id, 'reviewed'),
});

const mapDispatchToProps = (dispatch, { id }) => ({
  setReviewed: () => dispatch(setSolutionFlag(id, 'reviewed', true)),
  unsetReviewed: () => dispatch(setSolutionFlag(id, 'reviewed', false)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ReviewSolutionContainer);
