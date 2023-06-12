import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import SolutionActions from '../../components/Solutions/SolutionActions';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import { setSolutionReviewState, deleteSolutionReview } from '../../redux/modules/solutionReviews';
import { getSolution, isSetFlagPending } from '../../redux/selectors/solutions';
import { isSolutionReviewUpdatePending } from '../../redux/selectors/solutionReviews';
import { setSolutionFlag } from '../../redux/modules/solutions';

const SolutionActionsContainer = ({
  id,
  solution,
  updatePending,
  setReviewState,
  deleteReview,
  acceptPending,
  setAccepted,
  ...props
}) => {
  return (
    <ResourceRenderer resource={solution}>
      {solution => (
        <SolutionActions
          {...props}
          id={id}
          solution={solution}
          acceptPending={acceptPending}
          updatePending={updatePending}
          setAccepted={setAccepted}
          setReviewState={setReviewState}
          deleteReview={deleteReview}
        />
      )}
    </ResourceRenderer>
  );
};

SolutionActionsContainer.propTypes = {
  id: PropTypes.string.isRequired,
  solution: ImmutablePropTypes.map,
  acceptPending: PropTypes.bool.isRequired,
  updatePending: PropTypes.bool,
  setAccepted: PropTypes.func.isRequired,
  setReviewState: PropTypes.func.isRequired,
  deleteReview: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { id }) => ({
  solution: getSolution(state, id),
  acceptPending: isSetFlagPending(state, id, 'accepted'),
  updatePending: isSolutionReviewUpdatePending(state, id),
});

const mapDispatchToProps = (dispatch, { id }) => ({
  setAccepted: accepted => dispatch(setSolutionFlag(id, 'accepted', accepted)),
  setReviewState: closed => dispatch(setSolutionReviewState(id, closed)),
  deleteReview: () => dispatch(deleteSolutionReview(id)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SolutionActionsContainer);
