import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import BonusPointsForm from '../../components/Forms/BonusPointsForm';

import { setPoints } from '../../redux/modules/submissions';

class BonusPointsContainer extends Component {

  render() {
    const { evaluation, setPoints } = this.props;
    return (
      <BonusPointsForm
        onSubmit={setPoints}
        initialvalues={{ points: evaluation.bonusPoints }} />
    );
  }

}

BonusPointsContainer.propTypes = {
  submissionId: PropTypes.string.isRequired,
  evaluation: PropTypes.shape({
    bonusPoints: PropTypes.number.isRequired
  }).isRequired,
  setPoints: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({}),
  (dispatch, { submissionId }) => ({
    setPoints: ({ bonusPoints }) => dispatch(setPoints(submissionId, bonusPoints))
  })
)(BonusPointsContainer);
