import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ResubmitAllSolutions } from '../../components/buttons/ResubmitSolution';
import { resubmitAllSubmissions } from '../../redux/modules/submissions';
import { isResubmitAllPending } from '../../redux/selectors/assignments';

const ResubmitAllSolutionsContainer = ({
  assignmentId,
  resubmit,
  isResubmitting
}) => {
  return (
    <ResubmitAllSolutions
      id={assignmentId}
      resubmit={resubmit}
      isResubmitting={isResubmitting}
    />
  );
};

ResubmitAllSolutionsContainer.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired,
  isResubmitting: PropTypes.bool.isRequired
};

const mapStateToProps = (state, { assignmentId }) => ({
  isResubmitting: isResubmitAllPending(assignmentId)(state)
});

const mapDispatchToProps = (dispatch, { assignmentId }) => ({
  resubmit: () => dispatch(resubmitAllSubmissions(assignmentId))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  ResubmitAllSolutionsContainer
);
