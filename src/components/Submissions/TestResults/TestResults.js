import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '../../widgets/Box';
import TestResultsTable from '../TestResultsTable';

const TestResults = ({ evaluation, runtimeEnvironmentId }) =>
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
    <TestResultsTable
      results={evaluation.testResults}
      runtimeEnvironmentId={runtimeEnvironmentId}
    />
  </Box>;

TestResults.propTypes = {
  evaluation: PropTypes.object.isRequired,
  runtimeEnvironmentId: PropTypes.string
};

export default TestResults;
