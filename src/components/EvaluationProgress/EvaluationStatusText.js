import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

const EvaluationStatusText = ({ status }) => {
  switch (status) {
    case 'COMPLETED':
      return <FormattedMessage id="app.evaluationProgressStatus.completed" defaultMessage="COMPLETED" />;
    case 'SKIPPED':
      return <FormattedMessage id="app.evaluationProgressStatus.skipped" defaultMessage="SKIPPED" />;
    case 'FAILED':
      return <FormattedMessage id="app.evaluationProgressStatus.failed" defaultMessage="FAILED" />;
    default:
      return <FormattedMessage id="app.evaluationProgressStatus.ok" defaultMessage="OK" />;
  }
};

EvaluationStatusText.propTypes = {
  status: PropTypes.string.isRequired
};

export default EvaluationStatusText;
