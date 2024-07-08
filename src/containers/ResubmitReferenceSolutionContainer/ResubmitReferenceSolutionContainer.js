import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { lruMemoize } from 'reselect';

import ResubmitSolution from '../../components/buttons/ResubmitSolution';
import { resubmitReferenceSolution, fetchReferenceSolution } from '../../redux/modules/referenceSolutions.js';
import EvaluationProgressContainer from '../EvaluationProgressContainer';
import { fetchReferenceSolutionEvaluationsForSolution } from '../../redux/modules/referenceSolutionEvaluations.js';
import { isProcessing, getMonitorParams, getSubmittedSolutionId } from '../../redux/selectors/submission.js';
import { getProgressObserverId } from '../../redux/selectors/evaluationProgress.js';

const getResubmitObserverId = lruMemoize((id, isDebug) => 'resubmit_' + (isDebug ? 'debug' : 'regular') + '_' + id);

class ResubmitReferenceSolutionContainer extends Component {
  isMeTheObserver = () => {
    const { id, isDebug = true, progressObserverId } = this.props;
    return progressObserverId === getResubmitObserverId(id, isDebug);
  };

  render() {
    const { id, resubmit, isProcessing, monitor, refreshSolutionEvaluations, isDebug = true } = this.props;
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
  monitor: PropTypes.object,
  isProcessing: PropTypes.bool,
  progressObserverId: PropTypes.string,
  refreshSolutionEvaluations: PropTypes.func,
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  monitor: getMonitorParams(state),
  newSolutionId: getSubmittedSolutionId(state),
  progressObserverId: getProgressObserverId(state),
});

const mapDispatchToProps = (dispatch, { id }) => ({
  resubmit: (progressObserverId, isDebug) => dispatch(resubmitReferenceSolution(id, progressObserverId, isDebug)),
  refreshSolutionEvaluations: () =>
    Promise.all([dispatch(fetchReferenceSolution(id)), dispatch(fetchReferenceSolutionEvaluationsForSolution(id))]),
});

export default connect(mapStateToProps, mapDispatchToProps)(ResubmitReferenceSolutionContainer);
