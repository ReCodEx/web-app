import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { downloadEvaluationArchive } from '../../redux/modules/submissionEvaluations';
import { downloadEvaluationArchive as downloadRefEvaluationArchive } from '../../redux/modules/referenceSolutionEvaluations';
import ResultArchiveInfoBox from '../../components/Solutions/ResultArchiveInfoBox';

const DownloadResultArchiveContainer = ({
  submissionId,
  downloadResultArchive,
  downloadRefResultArchive,
  isReference = false
}) =>
  <a
    href="#"
    onClick={isReference ? downloadRefResultArchive : downloadResultArchive}
  >
    <ResultArchiveInfoBox id={submissionId} />
  </a>;

DownloadResultArchiveContainer.propTypes = {
  submissionId: PropTypes.string.isRequired,
  downloadResultArchive: PropTypes.func.isRequired,
  downloadRefResultArchive: PropTypes.func.isRequired,
  isReference: PropTypes.bool
};

export default connect(
  (state, props) => ({}),
  (dispatch, { submissionId }) => ({
    downloadResultArchive: e => {
      e.preventDefault();
      dispatch(downloadEvaluationArchive(submissionId));
    },
    downloadRefResultArchive: e => {
      e.preventDefault();
      dispatch(downloadRefEvaluationArchive(submissionId));
    }
  })
)(DownloadResultArchiveContainer);
