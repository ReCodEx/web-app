import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import prettyMs from 'pretty-ms';
import { prettyPrintBytes } from '../../helpers/stringFormatters';

import exitCodeMapping from '../../helpers/exitCodeMapping';

const hasValue = value => value !== null;

const tickOrCrossAndRatioOrValue = (isOK, ratio, value, pretty) =>
  <td
    className={classNames({
      'text-center': true,
      'text-success': isOK,
      'text-danger': !isOK
    })}
  >
    <Icon name={isOK ? 'check' : 'times'} />{' '}
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
      {hasValue(value) && pretty(value * 1000)}
    </small>
  </td>;

const TestResultsTable = ({ results, runtimeEnvironmentId }) =>
  <Table responsive>
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
              <Icon name="check" />/<Icon name="times" />
            </span>
          </OverlayTrigger>
        </th>
        <th className="text-center">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="status">
                <FormattedMessage
                  id="app.submissions.testResultsTable.status"
                  defaultMessage="Evaluation status"
                />
              </Tooltip>
            }
          >
            <Icon name="balance-scale" />
          </OverlayTrigger>
        </th>
        <th className="text-center">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="memoryExceeded">
                <FormattedMessage
                  id="app.submissions.testResultsTable.memoryExceeded"
                  defaultMessage="Memory limit"
                />
              </Tooltip>
            }
          >
            <Icon name="microchip" />
          </OverlayTrigger>
        </th>
        <th className="text-center">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="timeExceeded">
                <FormattedMessage
                  id="app.submissions.testResultsTable.timeExceeded"
                  defaultMessage="Time limit"
                />
              </Tooltip>
            }
          >
            <Icon name="hourglass-end" />
          </OverlayTrigger>
        </th>
        <th className="text-center">
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="exitCode">
                <FormattedMessage
                  id="app.submissions.testResultsTable.exitCode"
                  defaultMessage="Exit code"
                />
              </Tooltip>
            }
          >
            <Icon name="exclamation-circle" />
          </OverlayTrigger>
        </th>
      </tr>
    </thead>
    <tbody>
      {results.map(
        ({
          id,
          testName,
          score,
          status,
          memoryExceeded,
          timeExceeded,
          message,
          timeRatio,
          memoryRatio,
          time,
          memory,
          exitCode
        }) =>
          <tr key={testName}>
            <td>
              {testName}
            </td>
            <td
              className={classNames({
                'text-center': true,
                'text-success': score === 1,
                'text-danger': score !== 1
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

            {tickOrCrossAndRatioOrValue(
              memoryExceeded === false,
              memoryRatio,
              memory,
              prettyPrintBytes
            )}
            {tickOrCrossAndRatioOrValue(
              timeExceeded === false,
              timeRatio,
              time,
              prettyMs
            )}

            <td className="text-center">
              {exitCodeMapping(runtimeEnvironmentId, exitCode)}
            </td>
          </tr>
      )}
    </tbody>
  </Table>;

TestResultsTable.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      testName: PropTypes.string
    })
  ).isRequired,
  runtimeEnvironmentId: PropTypes.string
};

export default TestResultsTable;
