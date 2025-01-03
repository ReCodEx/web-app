import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import prettyMs from 'pretty-ms';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Explanation from '../../widgets/Explanation';
import { prettyPrintBytes } from '../../helpers/stringFormatters.js';
import exitCodeMapping from '../../helpers/exitCodeMapping.js';
import Icon, { SuccessOrFailureIcon } from '../../icons';

const hasValue = value => value !== null;

const tickOrCrossAndRatioOrValue = (isOK, ratio, value, pretty, multiplier) => (
  <span
    className={classnames({
      'text-center': true,
      'text-success': isOK,
      'text-danger': !isOK,
    })}>
    <SuccessOrFailureIcon success={isOK} gapRight={1} />
    <small>
      {hasValue(value) && '('}
      {(ratio || ratio === 0) && (
        <FormattedNumber value={ratio} style="percent" minimumFractionDigits={1} maximumFactionDigits={3} />
      )}
      {hasValue(value) && ') '}
      {hasValue(value) && pretty(value * multiplier)}
    </small>
  </span>
);

const showTimeResults = (wallTime, wallTimeRatio, wallTimeExceeded, cpuTime, cpuTimeRatio, cpuTimeExceeded) => {
  const showWall = Boolean(wallTimeRatio) || (wallTimeExceeded && !cpuTimeExceeded);
  const showCpu = Boolean(cpuTimeRatio) || cpuTimeExceeded || !showWall;
  return (
    <table className="d-inline-block">
      <tbody>
        {showCpu && (
          <tr>
            <td className="text-body-secondary p-0">
              <Icon
                icon="microchip"
                gapRight={2}
                tooltipId="cpu-time-icon"
                tooltipPlacement="top"
                tooltip={
                  <FormattedMessage
                    id="app.submissions.testResultsTable.cpuTimeExplain"
                    defaultMessage="CPU time (total time the CPU was used by all threads)"
                  />
                }
              />
            </td>
            <td className="text-start p-0 text-nowrap">
              {tickOrCrossAndRatioOrValue(cpuTimeExceeded === false, cpuTimeRatio, cpuTime, prettyMs, 1000)}
            </td>
          </tr>
        )}
        {showWall && (
          <tr>
            <td className="text-body-secondary p-0">
              <Icon
                icon={['far', 'clock']}
                gapRight={2}
                tooltipId="wall-time-icon"
                tooltipPlacement="top"
                tooltip={
                  <FormattedMessage
                    id="app.submissions.testResultsTable.wallTimeExplain"
                    defaultMessage="Wall time (real-time measured by external clock)"
                  />
                }
              />
            </td>
            <td className="text-start p-0 text-nowrap">
              {tickOrCrossAndRatioOrValue(wallTimeExceeded === false, wallTimeRatio, wallTime, prettyMs, 1000)}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const TestResultsTableRow = ({
  runtimeEnvironmentId,
  showJudgeLogStdout = false,
  showJudgeLogStderr = false,
  isLogOpen = false,
  result: {
    testName,
    score,
    status,
    memoryExceeded,
    wallTimeExceeded,
    cpuTimeExceeded,
    memoryRatio,
    wallTimeRatio,
    cpuTimeRatio,
    memory,
    wallTime,
    cpuTime,
    exitCode,
    exitCodeOk,
    exitCodeNative,
    exitSignal,
    judgeLogStdout = '',
    judgeLogStderr = '',
  },
  toggleLogOpen = null,
  openInModal = null,
}) => (
  <tr key={testName}>
    <td>
      <strong>{testName}</strong>
    </td>
    <td
      className={classnames({
        'text-center': true,
        'text-success': score === 1,
        'text-danger': score === 0,
        'text-warning': score < 1 && score > 0,
      })}>
      <b>
        <FormattedNumber value={score} style="percent" />
      </b>
    </td>
    <td className="text-center">
      <b>
        {status === 'OK' && (
          <span className="text-success">
            <FormattedMessage id="app.submissions.testResultsTable.statusOK" defaultMessage="OK" />
          </span>
        )}
        {status === 'SKIPPED' && (
          <span className="text-warning">
            <FormattedMessage id="app.submissions.testResultsTable.statusSkipped" defaultMessage="SKIPPED" />
          </span>
        )}
        {status === 'FAILED' && (
          <span className="text-danger">
            <FormattedMessage id="app.submissions.testResultsTable.statusFailed" defaultMessage="FAILED" />
          </span>
        )}
      </b>
    </td>

    <td className="text-center text-nowrap">
      {tickOrCrossAndRatioOrValue(memoryExceeded === false, memoryRatio, memory, prettyPrintBytes, 1024)}
    </td>
    <td className="text-center">
      {showTimeResults(wallTime, wallTimeRatio, wallTimeExceeded, cpuTime, cpuTimeRatio, cpuTimeExceeded)}
    </td>

    <td className="text-center">
      {Boolean(exitSignal) && (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="signal">
              <FormattedMessage
                id="app.submissions.testResultsTable.signalTooltip"
                defaultMessage="Process terminated by signal"
              />
            </Tooltip>
          }>
          <strong>
            <Icon icon="satellite-dish" className="text-danger" gapRight={2} />
            {exitSignal}
            {exitCode !== -1 && <br />}
          </strong>
        </OverlayTrigger>
      )}

      {exitCodeNative ? (
        <>
          <SuccessOrFailureIcon success={exitCodeOk} gapRight={2} />
          {exitCodeOk ? exitCode : exitCodeMapping(runtimeEnvironmentId, exitCode)}
          {(exitCode === 0) !== exitCodeOk && (
            <Explanation id={`exit-code-expl-${testName}`} placement="bottom">
              <FormattedMessage
                id="app.submissions.testResultsTable.exitCodeExplanation"
                defaultMessage="Usually, exit code 0 is treated as success and non-zero codes as errors. This exercise have specified alternative exit codes that are treated as a success of the executed solution."
              />
            </Explanation>
          )}
        </>
      ) : (
        !exitSignal && status !== 'SKIPPED' && <span className="text-body-secondary">{exitCode}</span>
      )}
    </td>

    {(showJudgeLogStdout || showJudgeLogStderr) && (
      <td className="text-end">
        <TheButtonGroup>
          {toggleLogOpen && ((judgeLogStdout && showJudgeLogStdout) || (judgeLogStderr && showJudgeLogStderr)) && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`showlog-btn-${testName}`}>
                  {isLogOpen ? (
                    <FormattedMessage id="app.submissions.testResultsTable.hideLog" defaultMessage="Hide log" />
                  ) : (
                    <FormattedMessage id="app.submissions.testResultsTable.showLog" defaultMessage="Show log" />
                  )}
                </Tooltip>
              }>
              <Button variant={isLogOpen ? 'secondary' : 'primary'} size="xs" onClick={() => toggleLogOpen(testName)}>
                {isLogOpen ? (
                  <Icon icon="circle-chevron-up" fixedWidth gapLeft={1} gapRight={1} />
                ) : (
                  <Icon icon="circle-chevron-down" fixedWidth gapLeft={1} gapRight={1} />
                )}
              </Button>
            </OverlayTrigger>
          )}

          {openInModal && ((judgeLogStdout && showJudgeLogStdout) || (judgeLogStderr && showJudgeLogStderr)) && (
            <OverlayTrigger
              placement="top"
              overlay={
                <Tooltip id={`showmodal-btn-${testName}`}>
                  <FormattedMessage
                    id="app.submissions.testResultsTable.showLogInModal"
                    defaultMessage="Show in window"
                  />
                </Tooltip>
              }>
              <Button variant="primary" size="xs" onClick={() => openInModal(testName)}>
                <Icon icon="expand" fixedWidth gapLeft={1} gapRight={1} />
              </Button>
            </OverlayTrigger>
          )}
        </TheButtonGroup>
      </td>
    )}
  </tr>
);

TestResultsTableRow.propTypes = {
  runtimeEnvironmentId: PropTypes.string,
  showJudgeLogStdout: PropTypes.bool,
  showJudgeLogStderr: PropTypes.bool,
  isLogOpen: PropTypes.bool,
  result: PropTypes.shape({
    testName: PropTypes.string,
    score: PropTypes.number,
    status: PropTypes.string,
    memoryExceeded: PropTypes.bool,
    wallTimeExceeded: PropTypes.bool,
    cpuTimeExceeded: PropTypes.bool,
    memoryRatio: PropTypes.number,
    wallTimeRatio: PropTypes.number,
    cpuTimeRatio: PropTypes.number,
    memory: PropTypes.number,
    wallTime: PropTypes.number,
    cpuTime: PropTypes.number,
    exitCode: PropTypes.number,
    exitCodeOk: PropTypes.bool,
    exitCodeNative: PropTypes.bool,
    exitSignal: PropTypes.number,
    judgeLogStdout: PropTypes.string,
    judgeLogStderr: PropTypes.string,
  }),
  toggleLogOpen: PropTypes.func,
  openInModal: PropTypes.func,
};

export default TestResultsTableRow;
