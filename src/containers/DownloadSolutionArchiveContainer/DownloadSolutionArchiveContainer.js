import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { downloadSolutionArchive } from '../../redux/modules/submissionEvaluations';
import { downloadSolutionArchive as downloadRefSolutionArchive } from '../../redux/modules/referenceSolutionEvaluations';
import SolutionArchiveInfoBox from '../../components/Solutions/SolutionArchiveInfoBox';

const DownloadResultArchiveContainer = ({
  solutionId,
  downloadSolutionArchive,
  downloadRefSolutionArchive,
  isReference = false,
}) => (
  <a href="#" onClick={isReference ? downloadRefSolutionArchive : downloadSolutionArchive}>
    <SolutionArchiveInfoBox id={solutionId} />
  </a>
);

DownloadResultArchiveContainer.propTypes = {
  solutionId: PropTypes.string.isRequired,
  downloadSolutionArchive: PropTypes.func.isRequired,
  downloadRefSolutionArchive: PropTypes.func.isRequired,
  isReference: PropTypes.bool,
};

export default connect(
  (state, props) => ({}),
  (dispatch, { solutionId }) => ({
    downloadSolutionArchive: e => {
      e.preventDefault();
      dispatch(downloadSolutionArchive(solutionId));
    },
    downloadRefSolutionArchive: e => {
      e.preventDefault();
      dispatch(downloadRefSolutionArchive(solutionId));
    },
  })
)(DownloadResultArchiveContainer);
