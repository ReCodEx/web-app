import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Icon, { CloseIcon, DownloadIcon, FailureIcon, SuccessIcon } from '../../icons';
import { downloadString } from '../../../redux/helpers/api/download.js';

import TestResultsTableRow from './TestResultsTableRow.js';
import TestResultsTableLog from './TestResultsTableLog.js';
import CopyLogToClipboard from './CopyLogToClipboard.js';

const getResult = lruMemoize((results, name) => results.find(r => r.testName === name));

class TestResultsTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      logModal: null,
    };
  }

  openLogModal = testName => {
    this.setState({ logModal: testName });
  };

  closeLogModal = () => {
    this.setState({ logModal: null });
  };

  isLogOpen = testName => Boolean(this.state[`open-${testName}`]);

  toggleLogOpen = testName => {
    this.setState({ [`open-${testName}`]: !this.isLogOpen(testName) });
  };

  setAllLogsState = open => () => {
    const { results } = this.props;
    results.forEach(({ testName, judgeLogStdout, judgeLogStderr }) => {
      if (judgeLogStdout || judgeLogStderr) {
        this.setState({ [`open-${testName}`]: open });
      }
    });
  };

  hasSingleLog = result => {
    const { showJudgeLogStdout = false, showJudgeLogStderr = false, isJudgeLogMerged = true } = this.props;
    return (
      isJudgeLogMerged ||
      !result?.judgeLogStdout ||
      !showJudgeLogStdout ||
      !result?.judgeLogStderr ||
      !showJudgeLogStderr
    );
  };

  getFirstLog = result => {
    const { showJudgeLogStdout = false, isJudgeLogMerged = true } = this.props;
    return !isJudgeLogMerged && (!result?.judgeLogStdout || !showJudgeLogStdout)
      ? result?.judgeLogStderr
      : result?.judgeLogStdout;
  };

  render() {
    const {
      results,
      showJudgeLogStdout = false,
      showJudgeLogStderr = false,
      isJudgeLogMerged = true,
      runtimeEnvironmentId,
    } = this.props;
    const showLogButton =
      (showJudgeLogStdout || showJudgeLogStderr) &&
      results.reduce(
        (out, { judgeLogStdout = '', judgeLogStderr = '' }) =>
          out ||
          (Boolean(judgeLogStdout) && showJudgeLogStdout) ||
          (Boolean(judgeLogStderr) && showJudgeLogStderr && !isJudgeLogMerged),
        false
      );
    const allLogsClosed =
      showLogButton && results.reduce((out, { testName }) => out && !this.isLogOpen(testName), true);

    return (
      <>
        <Table responsive className="mb-0">
          <thead>
            <tr>
              <th />
              <th className="text-center text-nowrap text-body-secondary">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="status">
                      <FormattedMessage
                        id="app.submissions.testResultsTable.overallTestResult"
                        defaultMessage="Overall test result"
                      />
                    </Tooltip>
                  }>
                  <span>
                    <SuccessIcon smallGapRight className="text-body-secondary" />/
                    <FailureIcon smallGapLeft className="text-body-secondary" />
                  </span>
                </OverlayTrigger>
              </th>
              <th className="text-center text-nowrap text-body-secondary">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="correctness">
                      <FormattedMessage
                        id="app.submissions.testResultsTable.correctness"
                        defaultMessage="Correctness of the result (verdict of the judge)"
                      />
                    </Tooltip>
                  }>
                  <Icon icon="balance-scale" />
                </OverlayTrigger>
              </th>
              <th className="text-center text-nowrap text-body-secondary">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="memoryExceeded">
                      <FormattedMessage
                        id="app.submissions.testResultsTable.memoryExceeded"
                        defaultMessage="Measured memory utilization"
                      />
                    </Tooltip>
                  }>
                  <span>
                    <Icon icon="thermometer-half" gapRight />
                    <Icon icon="memory" />
                  </span>
                </OverlayTrigger>
              </th>
              <th className="text-center text-nowrap text-body-secondary">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="timeExceeded">
                      <FormattedMessage
                        id="app.submissions.testResultsTable.timeExceeded"
                        defaultMessage="Measured execution time"
                      />
                    </Tooltip>
                  }>
                  <span>
                    <Icon icon="thermometer-half" gapRight />
                    <Icon icon="running" />
                  </span>
                </OverlayTrigger>
              </th>
              <th className="text-center text-nowrap text-body-secondary">
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip id="exitCode">
                      <FormattedMessage
                        id="app.submissions.testResultsTable.exitCode"
                        defaultMessage="Exit code (possibly translated into error message if translation is available)"
                      />
                    </Tooltip>
                  }>
                  <Icon icon="power-off" />
                </OverlayTrigger>
              </th>
              {(showJudgeLogStdout || (showJudgeLogStderr && !isJudgeLogMerged)) && (
                <th className="text-end">
                  {showLogButton && (
                    <Button
                      variant={allLogsClosed ? 'primary' : 'secondary'}
                      size="xs"
                      onClick={this.setAllLogsState(allLogsClosed)}>
                      {allLogsClosed ? (
                        <FormattedMessage id="generic.showAll" defaultMessage="Show All" />
                      ) : (
                        <FormattedMessage id="generic.hideAll" defaultMessage="Hide All" />
                      )}
                    </Button>
                  )}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {results.map(result =>
              this.isLogOpen(result.testName) ? (
                [
                  <TestResultsTableRow
                    key={result.testName}
                    result={result}
                    runtimeEnvironmentId={runtimeEnvironmentId}
                    showJudgeLogStdout={showJudgeLogStdout}
                    showJudgeLogStderr={showJudgeLogStderr}
                    isLogOpen
                    toggleLogOpen={this.toggleLogOpen}
                    openInModal={this.openLogModal}
                  />,
                  <TestResultsTableLog key={`log-${result.testName}`} {...result} {...this.props} small />,
                ]
              ) : (
                <TestResultsTableRow
                  key={result.testName}
                  result={result}
                  runtimeEnvironmentId={runtimeEnvironmentId}
                  showJudgeLogStdout={showJudgeLogStdout}
                  showJudgeLogStderr={showJudgeLogStderr}
                  toggleLogOpen={this.toggleLogOpen}
                  openInModal={this.openLogModal}
                />
              )
            )}
          </tbody>
        </Table>

        <Modal
          show={Boolean(this.state.logModal)}
          backdrop="static"
          onHide={this.closeLogModal}
          size="xl"
          className="full-width-modal">
          <Modal.Header closeButton>
            <Modal.Title>{this.state.logModal}</Modal.Title>
          </Modal.Header>

          {this.state.logModal && (
            <Modal.Body>
              <Table>
                <tbody>
                  <TestResultsTableRow
                    result={getResult(results, this.state.logModal)}
                    runtimeEnvironmentId={runtimeEnvironmentId}
                    showJudgeLogStdout={showJudgeLogStdout}
                    showJudgeLogStderr={showJudgeLogStderr}
                  />
                </tbody>
              </Table>
              <hr />
              <table>
                <tbody>
                  <TestResultsTableLog {...getResult(results, this.state.logModal)} {...this.props} />
                </tbody>
              </table>
            </Modal.Body>
          )}

          {this.state.logModal && (
            <Modal.Footer>
              <TheButtonGroup>
                {this.hasSingleLog(getResult(results, this.state.logModal)) && (
                  <>
                    <Button
                      variant="primary"
                      onClick={() =>
                        downloadString(
                          `${this.state.logModal}.log`,
                          this.getFirstLog(getResult(results, this.state.logModal)),
                          'text/plain;charset=utf-8'
                        )
                      }>
                      <DownloadIcon gapRight />
                      <FormattedMessage id="generic.download" defaultMessage="Download" />
                    </Button>
                    <CopyLogToClipboard log={this.getFirstLog(getResult(results, this.state.logModal))} />
                  </>
                )}

                <Button variant="secondary" onClick={this.closeLogModal}>
                  <CloseIcon gapRight />
                  <FormattedMessage id="generic.close" defaultMessage="Close" />
                </Button>
              </TheButtonGroup>
            </Modal.Footer>
          )}
        </Modal>
      </>
    );
  }
}

TestResultsTable.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      testName: PropTypes.string,
    })
  ).isRequired,
  runtimeEnvironmentId: PropTypes.string,
  showJudgeLogStdout: PropTypes.bool,
  showJudgeLogStderr: PropTypes.bool,
  isJudgeLogStdoutPublic: PropTypes.bool,
  isJudgeLogStderrPublic: PropTypes.bool,
  isJudgeLogMerged: PropTypes.bool,
};

export default TestResultsTable;
