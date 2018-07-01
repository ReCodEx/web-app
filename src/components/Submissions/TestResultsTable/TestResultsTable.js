import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import prettyMs from 'pretty-ms';

import Button from '../../widgets/FlatButton';
import { prettyPrintBytes } from '../../helpers/stringFormatters';
import exitCodeMapping from '../../helpers/exitCodeMapping';
import Icon from '../../icons';

import styles from './TestResultsTable.less';

const hasValue = value => value !== null;

const tickOrCrossAndRatioOrValue = (isOK, ratio, value, pretty, multiplier) =>
  <span
    className={classNames({
      'text-center': true,
      'text-success': isOK,
      'text-danger': !isOK
    })}
  >
    <Icon icon={isOK ? 'check' : 'times'} gapRight />
    <small>
      {hasValue(value) && '('}
      {(ratio || ratio === 0) &&
        <FormattedNumber
          value={ratio}
          style="percent"
          minimumFractionDigits={1}
          maximumFactionDigits={3}
        />}
      {hasValue(value) && ') '}
      {hasValue(value) && pretty(value * multiplier)}
    </small>
  </span>;

const showTimeResults = (
  key,
  wallTime,
  wallTimeRatio,
  wallTimeExceeded,
  cpuTime,
  cpuTimeRatio,
  cpuTimeExceeded
) => {
  const showWall =
    Boolean(wallTimeRatio) || (wallTimeExceeded && !cpuTimeExceeded);
  const showCpu = Boolean(cpuTimeRatio) || cpuTimeExceeded || !showWall;
  return (
    <table style={{ display: 'inline-block' }}>
      <tbody>
        {showCpu &&
          <tr>
            <td className="text-muted">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="wall-time-icon">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.cpuTimeExplain"
                      defaultMessage="CPU time (total time the CPU was used by all threads)"
                    />
                  </Tooltip>
                }
              >
                <Icon icon="microchip" style={{ marginRight: '10px' }} />
              </OverlayTrigger>
            </td>
            <td className="text-left">
              {tickOrCrossAndRatioOrValue(
                cpuTimeExceeded === false,
                cpuTimeRatio,
                cpuTime,
                prettyMs,
                1000
              )}
            </td>
          </tr>}
        {showWall &&
          <tr>
            <td className="text-muted">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="wall-time-icon">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.wallTimeExplain"
                      defaultMessage="Wall time (real-time measured by external clock)"
                    />
                  </Tooltip>
                }
              >
                <Icon icon={['far', 'clock']} style={{ marginRight: '10px' }} />
              </OverlayTrigger>
            </td>
            <td className="text-left">
              {tickOrCrossAndRatioOrValue(
                wallTimeExceeded === false,
                wallTimeRatio,
                wallTime,
                prettyMs,
                1000
              )}
            </td>
          </tr>}
      </tbody>
    </table>
  );
};

class TestResultsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  isLogOpen = testName => Boolean(this.state[testName]);

  toggleLogOpen = testName => {
    this.setState({ [testName]: !this.isLogOpen(testName) });
  };

  setAllLogsState = open => () => {
    const { results } = this.props;
    results.forEach(({ testName, judgeLog }) => {
      if (judgeLog) {
        this.setState({ [testName]: open });
      }
    });
  };

  renderRow = ({
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
    judgeLog = ''
  }) => {
    const { runtimeEnvironmentId, isSupervisor = false } = this.props;
    return (
      <tr key={testName}>
        <td>
          <strong>
            {testName}
          </strong>
        </td>
        <td
          className={classNames({
            'text-center': true,
            'text-success': score === 1,
            'text-danger': score === 0,
            'text-warning': score < 1 && score > 0
          })}
        >
          <b>
            <FormattedNumber value={score} style="percent" />
          </b>
        </td>
        <td className="text-center">
          <b>
            {status === 'OK' &&
              <span className="text-success">
                <FormattedMessage
                  id="app.submissions.testResultsTable.statusOK"
                  defaultMessage="OK"
                />
              </span>}
            {status === 'SKIPPED' &&
              <span className="text-warning">
                <FormattedMessage
                  id="app.submissions.testResultsTable.statusSkipped"
                  defaultMessage="SKIPPED"
                />
              </span>}
            {status === 'FAILED' &&
              <span className="text-danger">
                <FormattedMessage
                  id="app.submissions.testResultsTable.statusFailed"
                  defaultMessage="FAILED"
                />
              </span>}
          </b>
        </td>

        <td className="text-center">
          {tickOrCrossAndRatioOrValue(
            memoryExceeded === false,
            memoryRatio,
            memory,
            prettyPrintBytes,
            1024
          )}
        </td>
        <td className="text-center">
          {showTimeResults(
            testName,
            wallTime,
            wallTimeRatio,
            wallTimeExceeded,
            cpuTime,
            cpuTimeRatio,
            cpuTimeExceeded
          )}
        </td>

        <td className="text-center">
          {exitCodeMapping(runtimeEnvironmentId, exitCode)}
        </td>

        {isSupervisor &&
          <td className="text-right">
            {judgeLog &&
              <Button
                bsStyle={this.isLogOpen(testName) ? 'warning' : 'primary'}
                className="btn-flat"
                bsSize="xs"
                onClick={() => this.toggleLogOpen(testName)}
              >
                {this.isLogOpen(testName)
                  ? <FormattedMessage
                      id="app.submissions.testResultsTable.hideLog"
                      defaultMessage="Hide Log"
                    />
                  : <FormattedMessage
                      id="app.submissions.testResultsTable.showLog"
                      defaultMessage="Show Log"
                    />}
              </Button>}
          </td>}
      </tr>
    );
  };

  renderLog = ({ testName, judgeLog = '' }) =>
    <tr key={`${testName}-log`}>
      <td colSpan={7}>
        <table className={styles.logWrapper}>
          <tbody>
            <tr>
              <td>
                <pre className={styles.log}>
                  {judgeLog}
                </pre>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>;

  render() {
    const { results, isSupervisor = false } = this.props;
    const showLogButton =
      isSupervisor &&
      results.reduce(
        (out, { judgeLog = '' }) => out || Boolean(judgeLog),
        false
      );
    const allLogsClosed =
      showLogButton &&
      results.reduce(
        (out, { testName }) => out && !this.isLogOpen(testName),
        true
      );

    return (
      <Table responsive style={{}}>
        <thead>
          <tr>
            <th />
            <th className="text-center">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="status">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.overallTestResult"
                      defaultMessage="Overall test result"
                    />
                  </Tooltip>
                }
              >
                <span>
                  <Icon icon="check" />/<Icon icon="times" />
                </span>
              </OverlayTrigger>
            </th>
            <th className="text-center">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="correctness">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.correctness"
                      defaultMessage="Correctness of the result (verdict of the judge)"
                    />
                  </Tooltip>
                }
              >
                <Icon icon="balance-scale" />
              </OverlayTrigger>
            </th>
            <th className="text-center">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="memoryExceeded">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.memoryExceeded"
                      defaultMessage="Measured memory utilization"
                    />
                  </Tooltip>
                }
              >
                <span>
                  <Icon icon="thermometer-half" gapRight />
                  <Icon icon="braille" />
                </span>
              </OverlayTrigger>
            </th>
            <th className="text-center">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="timeExceeded">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.timeExceeded"
                      defaultMessage="Measured execution time"
                    />
                  </Tooltip>
                }
              >
                <span>
                  <Icon icon="thermometer-half" gapRight />
                  <Icon icon="bolt" />
                </span>
              </OverlayTrigger>
            </th>
            <th className="text-center">
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="exitCode">
                    <FormattedMessage
                      id="app.submissions.testResultsTable.exitCode"
                      defaultMessage="Exit code (possibly translated into error message if translation is available)"
                    />
                  </Tooltip>
                }
              >
                <Icon icon="power-off" />
              </OverlayTrigger>
            </th>
            {isSupervisor &&
              <th className="text-right">
                {showLogButton &&
                  <Button
                    bsStyle={allLogsClosed ? 'primary' : 'warning'}
                    className="btn-flat"
                    bsSize="xs"
                    onClick={this.setAllLogsState(allLogsClosed)}
                  >
                    {allLogsClosed
                      ? <FormattedMessage
                          id="generic.showAll"
                          defaultMessage="Show All"
                        />
                      : <FormattedMessage
                          id="generic.hideAll"
                          defaultMessage="Hide All"
                        />}
                  </Button>}
              </th>}
          </tr>
        </thead>
        <tbody>
          {results.map(
            result =>
              this.isLogOpen(result.testName)
                ? [this.renderRow(result), this.renderLog(result)]
                : this.renderRow(result)
          )}
        </tbody>
      </Table>
    );
  }
}

TestResultsTable.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      testName: PropTypes.string
    })
  ).isRequired,
  runtimeEnvironmentId: PropTypes.string,
  isSupervisor: PropTypes.bool
};

export default TestResultsTable;
