import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchReferenceSolutionEvaluationsForSolution } from '../../redux/modules/referenceSolutionEvaluations';
import { getReferenceSolutionEvaluationsByIdsSelector } from '../../redux/selectors/referenceSolutionEvaluations';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import ReferenceSolutionEvaluations from '../../components/ReferenceSolutions/ReferenceSolutionEvaluations';

class ReferenceSolutionEvaluationsContainer extends Component {
  componentWillMount() {
    ReferenceSolutionEvaluationsContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.referenceSolutionId !== newProps.referenceSolutionId) {
      ReferenceSolutionEvaluationsContainer.loadData(newProps);
    }
  }

  static loadData = ({ fetchEvaluationsOnLoad }) => {
    fetchEvaluationsOnLoad();
  };

  render() {
    const { referenceSolutionId, exerciseId, evaluations } = this.props;

    return (
      <ResourceRenderer resource={evaluations.toArray()}>
        {(...evaluations) =>
          <ReferenceSolutionEvaluations
            referenceSolutionId={referenceSolutionId}
            evaluations={evaluations}
            exerciseId={exerciseId}
          />}
      </ResourceRenderer>
    );
  }
}

ReferenceSolutionEvaluationsContainer.propTypes = {
  referenceSolutionId: PropTypes.string.isRequired,
  referenceSolution: PropTypes.object.isRequired,
  exerciseId: PropTypes.string.isRequired,
  evaluations: ImmutablePropTypes.map,
  fetchEvaluationsOnLoad: PropTypes.func.isRequired
};

export default connect(
  (state, { referenceSolution }) => ({
    evaluations: getReferenceSolutionEvaluationsByIdsSelector(
      referenceSolution.submissions
    )(state)
  }),
  (dispatch, { referenceSolutionId, exerciseId }) => ({
    fetchEvaluationsOnLoad: () =>
      dispatch(
        fetchReferenceSolutionEvaluationsForSolution(referenceSolutionId)
      )
  })
)(ReferenceSolutionEvaluationsContainer);
