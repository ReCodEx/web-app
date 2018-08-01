import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { SimpleInfoBox } from '../../widgets/InfoBox';

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

const ResultArchiveInfoBox = ({ id, intl: { formatMessage } }) =>
  <SimpleInfoBox
    icon={['far', 'file-archive']}
    title={formatMessage(messages.title)}
    description={formatMessage(messages.description)}
    color="green"
  />;

ResultArchiveInfoBox.propTypes = {
  id: PropTypes.string.isRequired,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired
};

export default injectIntl(ResultArchiveInfoBox);
