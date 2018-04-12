import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, defineMessages } from 'react-intl';
import { SimpleInfoBox } from '../../widgets/InfoBox';

const messages = defineMessages({
  title: {
    id: 'app.solutionArchiveInfoBox.title',
    defaultMessage: 'Solution archive'
  },
  description: {
    id: 'app.solutionArchiveInfoBox.description',
    defaultMessage: 'All submitted source files in one ZIP archive'
  }
});

const SolutionArchiveInfoBox = ({ id, intl: { formatMessage } }) =>
  <SimpleInfoBox
    icon={['far', 'file-archive']}
    title={formatMessage(messages.title)}
    description={formatMessage(messages.description)}
    color="blue"
  />;

SolutionArchiveInfoBox.propTypes = {
  id: PropTypes.string.isRequired,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired
};

export default injectIntl(SolutionArchiveInfoBox);
