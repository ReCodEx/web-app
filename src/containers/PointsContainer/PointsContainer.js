import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import PointsForm from '../../components/forms/PointsForm';

import { setPoints, fetchSolution } from '../../redux/modules/solutions';

const PointsContainer = ({
  overriddenPoints = null,
  bonusPoints,
  setPoints,
  ...props
}) => (
  <PointsForm
    onSubmit={setPoints}
    initialValues={{
      overriddenPoints,
      bonusPoints,
    }}
    {...props}
  />
);

PointsContainer.propTypes = {
  submissionId: PropTypes.string.isRequired,
  overriddenPoints: PropTypes.number,
  bonusPoints: PropTypes.number.isRequired,
  setPoints: PropTypes.func.isRequired,
};

export default connect(
  (state, props) => ({}),
  (dispatch, { submissionId }) => ({
    setPoints: ({ overriddenPoints, bonusPoints }) =>
      dispatch(setPoints(submissionId, overriddenPoints, bonusPoints)).then(
        () => dispatch(fetchSolution(submissionId))
      ),
  })
)(PointsContainer);
