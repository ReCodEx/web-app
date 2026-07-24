import React from 'react';
import PropTypes from 'prop-types';
import { useIntl, defineMessages } from 'react-intl';
import { SimpleInfoBox } from '../../widgets/InfoBox';

const messages = defineMessages({
  title: {
    id: 'app.resultsArchiveInfoBox.title',
    defaultMessage: 'Results archive',
  },
  description: {
    id: 'app.resultsArchiveInfoBox.description',
    defaultMessage: 'Detailed logs and dumps',
  },
});

const ResultArchiveInfoBox = ({ id }) => {
  const { formatMessage } = useIntl();
  return (
    <SimpleInfoBox
      icon={['far', 'file-archive']}
      title={formatMessage(messages.title)}
      description={formatMessage(messages.description)}
      color="success"
    />
  );
};

ResultArchiveInfoBox.propTypes = {
  id: PropTypes.string.isRequired,
};

export default ResultArchiveInfoBox;
