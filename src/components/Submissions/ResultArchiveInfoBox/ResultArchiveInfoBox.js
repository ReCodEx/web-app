import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { SimpleInfoBox } from '../../AdminLTE/InfoBox';

const ResultArchiveInfoBox = ({
  submissionId
}) => (
  <SimpleInfoBox
    icon='file-archive-o'
    title={<FormattedMessage id='app.resultsArchiveInfoBox.title' defaultMessage='Results archive' />}
    description={<FormattedMessage id='app.resultsArchiveInfoBox.description' defaultMessage='Detailed logs and dumps' />} />
);

ResultArchiveInfoBox.propTypes = {
  submissionId: PropTypes.string.isRequired
};

export default ResultArchiveInfoBox;
