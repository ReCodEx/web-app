import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import prettyMs from 'pretty-ms';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
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
    <SuccessOrFailureIcon success={isOK} smallGapRight />
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
            <td className="text-muted p-0">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="wall-time-icon">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.cpuTimeExplain"
                      defaultMessage="CPU time (total time the CPU was used by all threads)"
                    />
                  </Tooltip>
                }>
                <Icon icon="microchip" gapRight />
              </OverlayTrigger>
            </td>
            <td className="text-left p-0 text-nowrap">
              {tickOrCrossAndRatioOrValue(cpuTimeExceeded === false, cpuTimeRatio, cpuTime, prettyMs, 1000)}
            </td>
          </tr>
        )}
        {showWall && (
          <tr>
            <td className="text-muted p-0">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="wall-time-icon">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.wallTimeExplain"
                      defaultMessage="Wall time (real-time measured by external clock)"
                    />
                  </Tooltip>
                }>
                <Icon icon={['far', 'clock']} gapRight />
              </OverlayTrigger>
            </td>
            <td className="text-left p-0 text-nowrap">
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
            <Icon icon="satellite-dish" className="text-danger" gapRight />
            {exitSignal}
            {exitCode !== -1 && <br />}
          </strong>
        </OverlayTrigger>
      )}
      {(exitCode !== -1 || !exitSignal) && exitCodeMapping(runtimeEnvironmentId, exitCode)}
    </td>

    {(showJudgeLogStdout || showJudgeLogStderr) && (
      <td className="text-right">
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
                  <Icon icon="circle-chevron-up" fixedWidth smallGapLeft smallGapRight />
                ) : (
                  <Icon icon="circle-chevron-down" fixedWidth smallGapLeft smallGapRight />
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
                <Icon icon="expand" fixedWidth smallGapLeft smallGapRight />
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
    exitSignal: PropTypes.number,
    judgeLogStdout: PropTypes.string,
    judgeLogStderr: PropTypes.string,
  }),
  toggleLogOpen: PropTypes.func,
  openInModal: PropTypes.func,
};

export default TestResultsTableRow;
