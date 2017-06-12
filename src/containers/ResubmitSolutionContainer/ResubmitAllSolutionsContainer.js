import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { ResubmitAllSolutions } from '../../components/buttons/ResubmitSolution';
import { resubmitAllSubmissions } from '../../redux/modules/submissions';

const ResubmitAllSolutionsContainer = ({ assignmentId, resubmit }) => {
  return <ResubmitAllSolutions id={assignmentId} resubmit={resubmit} />;
};

ResubmitAllSolutionsContainer.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  resubmit: PropTypes.func.isRequired
};

const mapStateToProps = state => ({});

const mapDispatchToProps = (dispatch, { assignmentId }) => ({
  resubmit: () => dispatch(resubmitAllSubmissions(assignmentId))
});

export default connect(mapStateToProps, mapDispatchToProps)(
  ResubmitAllSolutionsContainer
);
