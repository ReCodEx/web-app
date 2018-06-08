import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

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

const ResubmitReferenceSolutionContainer = ({
  id,
  exerciseId,
  resubmit,
  isProcessing,
  monitor,
  newSolutionId,
  refreshSolutionEvaluations,
  isDebug = true,
  links: { EXERCISE_REFERENCE_SOLUTION_URI_FACTORY }
}) => {
  return (
    <span>
      <ResubmitSolution id={id} resubmit={resubmit} isDebug={isDebug} />
      <EvaluationProgressContainer
        isOpen={isProcessing}
        monitor={monitor}
        link={EXERCISE_REFERENCE_SOLUTION_URI_FACTORY(
          exerciseId,
          newSolutionId
        )}
        onFinish={refreshSolutionEvaluations}
        onUserClose={refreshSolutionEvaluations}
      />
    </span>
  );
};

ResubmitReferenceSolutionContainer.propTypes = {
  id: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  isDebug: PropTypes.bool,
  exerciseId: PropTypes.string.isRequired,
  monitor: PropTypes.object,
  isProcessing: PropTypes.bool,
  newSolutionId: PropTypes.string,
  links: PropTypes.object.isRequired,
  refreshSolutionEvaluations: PropTypes.func
};

const mapStateToProps = state => ({
  isProcessing: isProcessing(state),
  monitor: getMonitorParams(state),
  newSolutionId: getSubmissionId(state)
});

const mapDispatchToProps = (dispatch, { id }) => ({
  resubmit: isDebug => dispatch(resubmitReferenceSolution(id, isDebug)),
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
