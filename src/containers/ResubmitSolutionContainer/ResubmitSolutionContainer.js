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
import withLinks from '../../helpers/withLinks';
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
      assignmentId,
      userId,
      resubmit,
      monitor,
      isProcessing,
      newSubmissionId,
      fetchSubmissions,
      isDebug = true,
      links: { SOLUTION_DETAIL_URI_FACTORY }
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
          link={SOLUTION_DETAIL_URI_FACTORY(assignmentId, newSubmissionId)}
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
  newSubmissionId: PropTypes.string,
  progressObserverId: PropTypes.string,
  links: PropTypes.object.isRequired,
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

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(ResubmitSolutionContainer)
);
