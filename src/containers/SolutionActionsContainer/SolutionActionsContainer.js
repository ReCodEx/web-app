import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import SolutionActions from '../../components/Solutions/SolutionActions';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import { setSolutionReviewState, deleteSolutionReview } from '../../redux/modules/solutionReviews';
import { setPoints, setSolutionFlag } from '../../redux/modules/solutions';
import { getAssignment } from '../../redux/selectors/assignments';
import { getSolution, isPointsUpdatePending, isSetFlagPending } from '../../redux/selectors/solutions';
import { isSolutionReviewUpdatePending } from '../../redux/selectors/solutionReviews';

const SolutionActionsContainer = ({
  id,
  solution,
  assignment,
  pointsPending,
  updatePending,
  setReviewState,
  deleteReview,
  acceptPending,
  setAccepted,
  setPoints,
  ...props
}) => {
  return (
    <ResourceRenderer resource={[solution, assignment]}>
      {(solution, assignment) => (
        <SolutionActions
          {...props}
          id={id}
          solution={solution}
          assignment={assignment}
          pointsPending={pointsPending}
          acceptPending={acceptPending}
          updatePending={updatePending}
          setAccepted={setAccepted}
          setReviewState={setReviewState}
          deleteReview={deleteReview}
          setPoints={setPoints}
        />
      )}
    </ResourceRenderer>
  );
};

SolutionActionsContainer.propTypes = {
  id: PropTypes.string.isRequired,
  solution: ImmutablePropTypes.map,
  assignment: ImmutablePropTypes.map,
  pointsPending: PropTypes.bool.isRequired,
  acceptPending: PropTypes.bool.isRequired,
  updatePending: PropTypes.bool,
  setAccepted: PropTypes.func.isRequired,
  setReviewState: PropTypes.func.isRequired,
  deleteReview: PropTypes.func.isRequired,
  setPoints: PropTypes.func.isRequired,
};

const mapStateToProps = (state, { id }) => {
  const solution = getSolution(state, id);
  const assignmentId = solution && solution.getIn(['data', 'assignmentId']);
  return {
    solution,
    assignment: assignmentId && getAssignment(state, assignmentId),
    pointsPending: isPointsUpdatePending(state, id),
    acceptPending: isSetFlagPending(state, id, 'accepted'),
    updatePending: isSolutionReviewUpdatePending(state, id),
  };
};

const mapDispatchToProps = (dispatch, { id }) => ({
  setAccepted: accepted => dispatch(setSolutionFlag(id, 'accepted', accepted)),
  setReviewState: closed => dispatch(setSolutionReviewState(id, closed)),
  deleteReview: () => dispatch(deleteSolutionReview(id)),
  setPoints: ({ overriddenPoints, bonusPoints }) => dispatch(setPoints(id, overriddenPoints, bonusPoints)),
});

export default connect(mapStateToProps, mapDispatchToProps)(SolutionActionsContainer);
