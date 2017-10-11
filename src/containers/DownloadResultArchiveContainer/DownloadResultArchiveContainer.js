import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { downloadResultArchive } from '../../redux/modules/submissions';
import ResultArchiveInfoBox from '../../components/Submissions/ResultArchiveInfoBox';

const DownloadResultArchiveContainer = ({
  submissionId,
  downloadResultArchive
}) => (
  <a href="#" onClick={downloadResultArchive}>
    <ResultArchiveInfoBox id={submissionId} />
  </a>
);

DownloadResultArchiveContainer.propTypes = {
  submissionId: PropTypes.string.isRequired,
  downloadResultArchive: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({}),
  (dispatch, { submissionId }) => ({
    downloadResultArchive: e => {
      e.preventDefault();
      dispatch(downloadResultArchive(submissionId));
    }
  })
)(DownloadResultArchiveContainer);
