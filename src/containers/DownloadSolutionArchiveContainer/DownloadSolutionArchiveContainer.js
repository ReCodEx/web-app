import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';

import { downloadSolutionArchive } from '../../redux/modules/submissionEvaluations';
import { downloadSolutionArchive as downloadRefSolutionArchive } from '../../redux/modules/referenceSolutionEvaluations';
import SolutionArchiveInfoBox from '../../components/Solutions/SolutionArchiveInfoBox';
import Button from '../../components/widgets/TheButton';
import Icon from '../../components/icons';

const DownloadResultArchiveContainer = ({
  solutionId,
  downloadSolutionArchive,
  downloadRefSolutionArchive,
  isReference = false,
  simpleButton = false,
  variant = 'primary',
  size = null,
}) =>
  simpleButton ? (
    <Button onClick={isReference ? downloadRefSolutionArchive : downloadSolutionArchive} variant={variant} size={size}>
      <Icon icon={['far', 'file-archive']} gapRight />
      <FormattedMessage id="app.solutionArchiveInfoBox.description" defaultMessage="All files in a ZIP archive" />
    </Button>
  ) : (
    <a href="#" onClick={isReference ? downloadRefSolutionArchive : downloadSolutionArchive}>
      <SolutionArchiveInfoBox id={solutionId} />
    </a>
  );

DownloadResultArchiveContainer.propTypes = {
  solutionId: PropTypes.string.isRequired,
  downloadSolutionArchive: PropTypes.func.isRequired,
  downloadRefSolutionArchive: PropTypes.func.isRequired,
  isReference: PropTypes.bool,
  simpleButton: PropTypes.bool,
  variant: PropTypes.string,
  size: PropTypes.string,
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
