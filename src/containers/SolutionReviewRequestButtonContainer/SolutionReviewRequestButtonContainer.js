import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ImmutablePropTypes from 'react-immutable-proptypes';

import SolutionReviewRequestButton from '../../components/buttons/SolutionReviewRequestButton';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

import { setSolutionFlag } from '../../redux/modules/solutions.js';
import { getSolution, isSetFlagPending } from '../../redux/selectors/solutions.js';
import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';

const SolutionReviewRequestButtonContainer = ({
  id,
  loggedUserId = null,
  solution,
  setFlagPending,
  setReviewRequest,
  cancelReviewRequest,
}) => {
  return (
    <ResourceRenderer resource={solution}>
      {solution => (
        <SolutionReviewRequestButton
          id={id}
          onBehalf={loggedUserId !== solution.authorId}
          onClck={solution.reviewRequest ? cancelReviewRequest : setReviewRequest}
          reviewRequest={solution.reviewRequest}
          pending={setFlagPending}
        />
      )}
    </ResourceRenderer>
  );
};

SolutionReviewRequestButtonContainer.propTypes = {
  id: PropTypes.string.isRequired,
  loggedUserId: PropTypes.string,
  solution: ImmutablePropTypes.map,
  setFlagPending: PropTypes.bool,
  setReviewRequest: PropTypes.func.isRequired,
  cancelReviewRequest: PropTypes.func.isRequired,
};

export default connect(
  (state, { id }) => {
    return {
      loggedUserId: loggedInUserIdSelector(state),
      solution: getSolution(state, id),
      setFlagPending: isSetFlagPending(state, id, 'accepted'),
    };
  },
  (dispatch, { id }) => ({
    setReviewRequest: () => dispatch(setSolutionFlag(id, 'reviewRequest', true)),
    cancelReviewRequest: () => dispatch(setSolutionFlag(id, 'reviewRequest', false)),
  })
)(SolutionReviewRequestButtonContainer);
