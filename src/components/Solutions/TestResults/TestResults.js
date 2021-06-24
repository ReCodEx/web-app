import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import Box from '../../widgets/Box';
import TestResultsTable from '../TestResultsTable';
import { defaultMemoize } from 'reselect';

const getSortedTestResults = defaultMemoize(({ testResults }, locale) =>
  testResults.sort((a, b) => a.testName.localeCompare(b.testName, locale))
);

const TestResults = ({
  evaluation,
  runtimeEnvironmentId,
  showJudgeLogStdout = false,
  showJudgeLogStderr = false,
  isJudgeLogStdoutPublic = null,
  isJudgeLogStderrPublic = null,
  isJudgeLogMerged = true,
  intl: { locale },
}) => (
  <Box
    title={<FormattedMessage id="app.submission.evaluation.title.testResults" defaultMessage="Test Results" />}
    noPadding
    collapsable
    isOpen
    unlimitedHeight>
    <TestResultsTable
      results={getSortedTestResults(evaluation, locale)}
      runtimeEnvironmentId={runtimeEnvironmentId}
      showJudgeLogStdout={showJudgeLogStdout}
      showJudgeLogStderr={showJudgeLogStderr}
      isJudgeLogStdoutPublic={isJudgeLogStdoutPublic}
      isJudgeLogStderrPublic={isJudgeLogStderrPublic}
      isJudgeLogMerged={isJudgeLogMerged}
    />
  </Box>
);

TestResults.propTypes = {
  evaluation: PropTypes.object.isRequired,
  runtimeEnvironmentId: PropTypes.string,
  showJudgeLogStdout: PropTypes.bool,
  showJudgeLogStderr: PropTypes.bool,
  isJudgeLogStdoutPublic: PropTypes.bool,
  isJudgeLogStderrPublic: PropTypes.bool,
  isJudgeLogMerged: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(TestResults);
