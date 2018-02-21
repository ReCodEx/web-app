import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ResubmitSolution from '../../components/buttons/ResubmitSolution';
import {
  resubmitSubmission,
  fetchUsersSubmissions
} from '../../redux/modules/submissions';
import {
  isProcessing,
  getMonitorParams,
  getSubmissionId
} from '../../redux/selectors/submission';
import EvaluationProgressContainer from '../EvaluationProgressContainer';
import withLinks from '../../helpers/withLinks';
import { fetchSubmissionEvaluationsForSolution } from '../../redux/modules/submissionEvaluations';

const ResubmitSolutionContainer = ({
  id,
  assignmentId,
  userId,
  resubmit,
  monitor,
  isProcessing,
  newSubmissionId,
  fetchSubmissions,
  isDebug = true,
  links: { SUBMISSION_DETAIL_URI_FACTORY }
}) => {
  return (
    <span>
      <ResubmitSolution id={id} resubmit={resubmit} isDebug={isDebug} />
      <EvaluationProgressContainer
        isOpen={isProcessing}
        monitor={monitor}
        link={SUBMISSION_DETAIL_URI_FACTORY(assignmentId, newSubmissionId)}
        onFinish={() => fetchSubmissions(userId)}
        onUserClose={() => fetchSubmissions(userId)}
      />
    </span>
  );
};

ResubmitSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  assignmentId: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  isPrivate: PropTypes.bool,
  monitor: PropTypes.object,
  isProcessing: PropTypes.bool,
  newSubmissionId: PropTypes.string,
  links: PropTypes.object.isRequired,
  isDebug: PropTypes.bool,
  userId: PropTypes.string,
  fetchSubmissions: PropTypes.func
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  monitor: getMonitorParams(state),
  newSubmissionId: getSubmissionId(state)
});

const mapDispatchToProps = (
  dispatch,
  { id, isPrivate = false, assignmentId }
) => ({
  resubmit: isDebug => dispatch(resubmitSubmission(id, isPrivate, isDebug)),
  fetchSubmissions: userId =>
    Promise.all([
      dispatch(fetchSubmissionEvaluationsForSolution(id)),
      dispatch(fetchUsersSubmissions(userId, assignmentId))
    ])
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(ResubmitSolutionContainer)
);
