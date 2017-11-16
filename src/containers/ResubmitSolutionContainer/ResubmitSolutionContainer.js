import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import ResubmitSolution from '../../components/buttons/ResubmitSolution';
import { resubmitSubmission } from '../../redux/modules/submissions';
import {
  isProcessing,
  getMonitorParams,
  getSubmissionId
} from '../../redux/selectors/submission';
import EvaluationProgressContainer from '../EvaluationProgressContainer';
import withLinks from '../../hoc/withLinks';

const ResubmitSolutionContainer = ({
  id,
  assignmentId,
  resubmit,
  monitor,
  isProcessing,
  newSubmissionId,
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
  isDebug: PropTypes.bool
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  monitor: getMonitorParams(state),
  newSubmissionId: getSubmissionId(state)
});

const mapDispatchToProps = (dispatch, { id, isPrivate = false }) => ({
  resubmit: isDebug => dispatch(resubmitSubmission(id, isPrivate, isDebug))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(ResubmitSolutionContainer)
);
