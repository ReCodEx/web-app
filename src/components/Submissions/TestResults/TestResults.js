import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '../../widgets/Box';
import TestResultsTable from '../TestResultsTable';

const TestResults = (
  {
    evaluation
  }
) => (
  <Box
    title={
      <FormattedMessage
        id="app.submission.evaluation.title.testResults"
        defaultMessage="Test results"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
  >
    <TestResultsTable results={evaluation.testResults} />
  </Box>
);

TestResults.propTypes = {
  evaluation: PropTypes.object.isRequired
};

export default TestResults;
