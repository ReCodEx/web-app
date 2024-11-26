import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import { DownloadIcon } from '../../icons';
import { downloadString } from '../../../redux/helpers/api/download.js';

import CopyLogToClipboard from './CopyLogToClipboard.js';
import * as styles from './TestResultsTable.less';

const TestResultsTableLog = ({
  testName,
  judgeLogStdout = '',
  judgeLogStderr = '',
  showJudgeLogStdout = false,
  showJudgeLogStderr = false,
  isJudgeLogStdoutPublic = null,
  isJudgeLogStderrPublic = null,
  isJudgeLogMerged = true,
  small = false,
}) => (
  <tr>
    <td colSpan={7} className={styles.logWrapper}>
      <table className={styles.logWrapper}>
        <tbody>
          {judgeLogStdout && showJudgeLogStdout && (
            <tr>
              <td>
                {!isJudgeLogMerged && (
                  <span className={'text-body-secondary' + (small ? ' small' : '')}>
                    <FormattedMessage id="app.submissions.testResultsTable.primaryLog" defaultMessage="Primary Log" />
                    {isJudgeLogStdoutPublic === false && (
                      <strong>
                        {' '}
                        (
                        <FormattedMessage
                          id="app.submissions.testResultsTable.logIsPrivate"
                          defaultMessage="not visible to students"
                        />
                        )
                      </strong>
                    )}
                    :
                  </span>
                )}
                <pre className={small ? styles.logSmall : styles.log}>{judgeLogStdout}</pre>
                {!small && judgeLogStderr && showJudgeLogStderr && !isJudgeLogMerged && (
                  <TheButtonGroup className="mb-4">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => downloadString(`${testName}.log`, judgeLogStdout, 'text/plain;charset=utf-8')}>
                      <DownloadIcon gapRight={2} />
                      <FormattedMessage id="generic.download" defaultMessage="Download" />
                    </Button>
                    <CopyLogToClipboard log={judgeLogStdout} size="sm" />
                  </TheButtonGroup>
                )}
              </td>
            </tr>
          )}

          {judgeLogStderr && showJudgeLogStderr && !isJudgeLogMerged && (
            <tr>
              <td>
                {!isJudgeLogMerged && (
                  <span className={'text-body-secondary' + (small ? ' small' : '')}>
                    <FormattedMessage
                      id="app.submissions.testResultsTable.secondaryLog"
                      defaultMessage="Secondary Log"
                    />
                    {isJudgeLogStderrPublic === false && (
                      <strong>
                        {' '}
                        (
                        <FormattedMessage
                          id="app.submissions.testResultsTable.logIsPrivate"
                          defaultMessage="not visible to students"
                        />
                        )
                      </strong>
                    )}
                    :
                  </span>
                )}
                <pre className={small ? styles.logSmall : styles.log}>{judgeLogStderr}</pre>
                {!small && judgeLogStdout && showJudgeLogStdout && (
                  <TheButtonGroup>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        downloadString(`${testName}.secondary.log`, judgeLogStderr, 'text/plain;charset=utf-8')
                      }>
                      <DownloadIcon gapRight={2} />
                      <FormattedMessage id="generic.download" defaultMessage="Download" />
                    </Button>
                    <CopyLogToClipboard log={judgeLogStderr} size="sm" />
                  </TheButtonGroup>
                )}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </td>
  </tr>
);

TestResultsTableLog.propTypes = {
  testName: PropTypes.string,
  judgeLogStdout: PropTypes.string,
  judgeLogStderr: PropTypes.string,
  showJudgeLogStdout: PropTypes.bool,
  showJudgeLogStderr: PropTypes.bool,
  isJudgeLogStdoutPublic: PropTypes.bool,
  isJudgeLogStderrPublic: PropTypes.bool,
  isJudgeLogMerged: PropTypes.bool,
  small: PropTypes.bool,
};

export default TestResultsTableLog;
