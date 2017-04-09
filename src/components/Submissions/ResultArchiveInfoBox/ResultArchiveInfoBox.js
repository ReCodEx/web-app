import React, { PropTypes } from 'react';
import { injectIntl, defineMessages } from 'react-intl';
import { SimpleInfoBox } from '../../AdminLTE/InfoBox';

const messages = defineMessages({
  title: {
    id: 'app.resultsArchiveInfoBox.title',
    defaultMessage: 'Results archive'
  },
  description: {
    id: 'app.resultsArchiveInfoBox.description',
    defaultMessage: 'Detailed logs and dumps'
  }
});

const ResultArchiveInfoBox = (
  {
    submissionId,
    intl: { formatMessage }
  }
) => (
  <SimpleInfoBox
    icon="file-archive-o"
    title={formatMessage(messages.title)}
    description={formatMessage(messages.description)}
  />
);

ResultArchiveInfoBox.propTypes = {
  submissionId: PropTypes.string.isRequired,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired
};

export default injectIntl(ResultArchiveInfoBox);
