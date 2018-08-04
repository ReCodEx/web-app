import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '../../widgets/Box';
import TestResultsTable from '../TestResultsTable';

const TestResults = ({ evaluation, runtimeEnvironmentId, showJudgeLog }) =>
  <Box
    title={
      <FormattedMessage
        id="app.submission.evaluation.title.testResults"
        defaultMessage="Test Results"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
    unlimitedHeight
  >
    <TestResultsTable
      results={evaluation.testResults}
      runtimeEnvironmentId={runtimeEnvironmentId}
      showJudgeLog={showJudgeLog}
    />
  </Box>;

TestResults.propTypes = {
  evaluation: PropTypes.object.isRequired,
  runtimeEnvironmentId: PropTypes.string,
  showJudgeLog: PropTypes.bool
};

export default TestResults;
