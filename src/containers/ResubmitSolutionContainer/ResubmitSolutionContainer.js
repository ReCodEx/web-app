import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defaultMemoize } from 'reselect';

import ResubmitSolution from '../../components/buttons/ResubmitSolution';
import {
  resubmitSolution,
  fetchUsersSolutions
} from '../../redux/modules/solutions';
import {
  isProcessing,
  getMonitorParams,
  getSubmittedSolutionId
} from '../../redux/selectors/submission';
import EvaluationProgressContainer from '../EvaluationProgressContainer';
import { fetchSubmissionEvaluationsForSolution } from '../../redux/modules/submissionEvaluations';
import { getProgressObserverId } from '../../redux/selectors/evaluationProgress';

const getResubmitObserverId = defaultMemoize(
  (id, isDebug) => 'resubmit_' + (isDebug ? 'debug' : 'regular') + '_' + id
);

class ResubmitSolutionContainer extends Component {
  isMeTheObserver = () => {
    const { id, isDebug = true, progressObserverId } = this.props;
    return progressObserverId === getResubmitObserverId(id, isDebug);
  };

  render() {
    const {
      id,
      userId,
      resubmit,
      monitor,
      isProcessing,
      fetchSubmissions,
      isDebug = true
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
          onFinish={() => fetchSubmissions(userId)}
        />
      </span>
    );
  }
}

ResubmitSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  isPrivate: PropTypes.bool,
  monitor: PropTypes.object,
  isProcessing: PropTypes.bool,
  progressObserverId: PropTypes.string,
  isDebug: PropTypes.bool,
  userId: PropTypes.string,
  fetchSubmissions: PropTypes.func
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  monitor: getMonitorParams(state),
  newSubmissionId: getSubmittedSolutionId(state),
  progressObserverId: getProgressObserverId(state)
});

const mapDispatchToProps = (
  dispatch,
  { id, isPrivate = false, assignmentId }
) => ({
  resubmit: (progressObserverId, isDebug) =>
    dispatch(resubmitSolution(id, isPrivate, progressObserverId, isDebug)),
  fetchSubmissions: userId =>
    Promise.all([
      dispatch(fetchSubmissionEvaluationsForSolution(id)),
      dispatch(fetchUsersSolutions(userId, assignmentId))
    ])
});

export default connect(mapStateToProps, mapDispatchToProps)(
  ResubmitSolutionContainer
);
