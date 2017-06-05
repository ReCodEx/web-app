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
  isPrivate = false,
  monitor,
  isProcessing,
  newSubmissionId,
  links: { SUBMISSION_DETAIL_URI_FACTORY }
}) => {
  return (
    <span>
      <ResubmitSolution resubmit={resubmit} />
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
  links: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  monitor: getMonitorParams(state),
  newSubmissionId: getSubmissionId(state)
});

const mapDispatchToProps = (dispatch, { id, isPrivate }) => ({
  resubmit: () => dispatch(resubmitSubmission(id, isPrivate))
});

export default withLinks(
  connect(mapStateToProps, mapDispatchToProps)(ResubmitSolutionContainer)
);
