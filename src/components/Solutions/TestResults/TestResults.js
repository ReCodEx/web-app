import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, intlShape, injectIntl } from 'react-intl';
import Box from '../../widgets/Box';
import TestResultsTable from '../TestResultsTable';
import { defaultMemoize } from 'reselect';

const getSortedTestResults = defaultMemoize(({ testResults }, locale) =>
  testResults.sort((a, b) => a.testName.localeCompare(b.testName, locale))
);

const TestResults = ({ evaluation, runtimeEnvironmentId, showJudgeLog, intl: { locale } }) => (
  <Box
    title={<FormattedMessage id="app.submission.evaluation.title.testResults" defaultMessage="Test Results" />}
    noPadding
    collapsable
    isOpen
    unlimitedHeight>
    <TestResultsTable
      results={getSortedTestResults(evaluation, locale)}
      runtimeEnvironmentId={runtimeEnvironmentId}
      showJudgeLog={showJudgeLog}
    />
  </Box>
);

TestResults.propTypes = {
  evaluation: PropTypes.object.isRequired,
  runtimeEnvironmentId: PropTypes.string,
  showJudgeLog: PropTypes.bool,
  intl: intlShape.isRequired,
};

export default injectIntl(TestResults);
