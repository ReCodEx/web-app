import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BonusPointsForm from '../../components/forms/BonusPointsForm';

import { setPoints } from '../../redux/modules/submissions';

const BonusPointsContainer = ({ bonusPoints, setPoints }) =>
  <BonusPointsForm
    onSubmit={setPoints}
    initialvalues={{ points: bonusPoints }}
  />;

BonusPointsContainer.propTypes = {
  submissionId: PropTypes.string.isRequired,
  bonusPoints: PropTypes.number.isRequired,
  setPoints: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({}),
  (dispatch, { submissionId }) => ({
    setPoints: ({ bonusPoints }) =>
      dispatch(setPoints(submissionId, bonusPoints))
  })
)(BonusPointsContainer);
