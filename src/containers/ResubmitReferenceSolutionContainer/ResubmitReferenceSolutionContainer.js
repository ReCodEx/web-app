import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';

import ResubmitSolution from '../../components/buttons/ResubmitSolution';
import {
  resubmitReferenceSolution,
  fetchReferenceSolution
} from '../../redux/modules/referenceSolutions';
import EvaluationProgressContainer from '../EvaluationProgressContainer';
import withLinks from '../../helpers/withLinks';
import { fetchReferenceSolutionEvaluationsForSolution } from '../../redux/modules/referenceSolutionEvaluations';
import {
  isProcessing,
  getMonitorParams,
  getSubmissionId
} from '../../redux/selectors/submission';
import { getProgressObserverId } from '../../redux/selectors/evaluationProgress';

const getResubmitObserverId = defaultMemoize(
  (id, isDebug) => 'resubmit_' + (isDebug ? 'debug' : 'regular') + '_' + id
);

class ResubmitReferenceSolutionContainer extends Component {
  isMeTheObserver = () => {
    const { id, isDebug = true, progressObserverId } = this.props;
    return progressObserverId === getResubmitObserverId(id, isDebug);
  };

  render() {
    const {
      id,
      exerciseId,
      resubmit,
      isProcessing,
      monitor,
      newSolutionId,
      refreshSolutionEvaluations,
      isDebug = true,
      links: { EXERCISE_REFERENCE_SOLUTION_URI_FACTORY }
    } = this.props;
    return (
      <span>
        <ResubmitSolution
          id={id}
          resubmit={resubmit}
          progressObserverId={getResubmitObserverId(id, isDebug)}
          isDebug={isDebug}
        />
        <EvaluationProgressContainer
          isOpen={isProcessing && this.isMeTheObserver()}
          monitor={this.isMeTheObserver() ? monitor : null}
          link={EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(
            exerciseId,
            newSolutionId
          )}
          onFinish={refreshSolutionEvaluations}
        />
      </span>
    );
  }
}

ResubmitReferenceSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  isDebug: PropTypes.bool,
  exerciseId: PropTypes.string.isRequired,
  monitor: PropTypes.object,
  isProcessing: PropTypes.bool,
  newSolutionId: PropTypes.string,
  progressObserverId: PropTypes.string,
  links: PropTypes.object.isRequired,
  refreshSolutionEvaluations: PropTypes.func
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  monitor: getMonitorParams(state),
  newSolutionId: getSubmissionId(state),
  progressObserverId: getProgressObserverId(state)
});

const mapDispatchToProps = (dispatch, { id }) => ({
  resubmit: (progressObserverId, isDebug) =>
    dispatch(resubmitReferenceSolution(id, progressObserverId, isDebug)),
  refreshSolutionEvaluations: () =>
    Promise.all([
      dispatch(fetchReferenceSolution(id)),
      dispatch(fetchReferenceSolutionEvaluationsForSolution(id))
    ])
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(
    ResubmitReferenceSolutionContainer
  )
);
