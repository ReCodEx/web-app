import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { downloadSolutionArchive } from '../../redux/modules/submissionEvaluations';
import SolutionArchiveInfoBox from '../../components/Submissions/SolutionArchiveInfoBox';

const DownloadResultArchiveContainer = ({
  solutionId,
  downloadSolutionArchive
}) =>
  <a href="#" onClick={downloadSolutionArchive}>
    <SolutionArchiveInfoBox id={solutionId} />
  </a>;

DownloadResultArchiveContainer.propTypes = {
  solutionId: PropTypes.string.isRequired,
  downloadSolutionArchive: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({}),
  (dispatch, { solutionId }) => ({
    downloadSolutionArchive: e => {
      e.preventDefault();
      dispatch(downloadSolutionArchive(solutionId));
    }
  })
)(DownloadResultArchiveContainer);
