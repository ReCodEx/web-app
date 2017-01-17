import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';

import { downloadResultArchive } from '../../redux/modules/submissions';
import ResultArchiveInfoBox from '../../components/Submissions/ResultArchiveInfoBox';

const DownloadResultArchiveContainer = ({
  submissionId,
  downloadResultArchive
}) => (
  <a href="#" onClick={downloadResultArchive}>
    <ResultArchiveInfoBox submissionId={submissionId} />
  </a>
);

DownloadResultArchiveContainer.propTypes = {
  submissionId: PropTypes.string.isRequired
};

export default connect(
  (state, props) => ({}),
  (dispatch, { submissionId }) => ({
    downloadResultArchive: () => dispatch(downloadResultArchive(submissionId))
  })
)(DownloadResultArchiveContainer);
