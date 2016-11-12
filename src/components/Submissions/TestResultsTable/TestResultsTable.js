import React, { PropTypes } from 'react';
import classNames from 'classnames';
import { FormattedMessage, FormattedNumber } from 'react-intl';
import { Table, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Icon from 'react-fontawesome';

const getTickORCheckTableCell = isOK => (
  <td className={
    classNames({
      'text-center': true,
      'text-success': isOK,
      'text-danger': !isOK
    })
  }>
    <Icon name={isOK ? 'check' : 'times'} />
  </td>
);

const getTickORCheckTableCellOverlay = (isOK, ratio) => (
  <td className={
    classNames({
      'text-center': true,
      'text-success': isOK,
      'text-danger': !isOK
    })
  }>
    <OverlayTrigger placement='top' overlay={
      <Tooltip id='ratio'>
        <FormattedMessage id='app.submissions.testResultsTable.ratioTooltip' defaultMessage='Ratio:' /> {ratio}
      </Tooltip>
    }>
      <Icon name={isOK ? 'check' : 'times'} />
    </OverlayTrigger>
  </td>
);

const TestResultsTable = ({ results }) => (
  <Table responsive>
    <thead>
      <tr>
        <th className='text-center'>
          <OverlayTrigger placement='top' overlay={
            <Tooltip id='status'>
              <FormattedMessage id='app.submissions.testResultsTable.overallTestResult' defaultMessage='Overall test result' />
            </Tooltip>
          }>
            <span><Icon name='check' />/<Icon name='times' /></span>
          </OverlayTrigger>
        </th>
        <th><FormattedMessage id='app.submissions.testResultsTable.testName' defaultMessage='Test name' /></th>
        <th></th>
        <th className='text-center'>
          <OverlayTrigger placement='top' overlay={
            <Tooltip id='status'>
              <FormattedMessage id='app.submissions.testResultsTable.status' defaultMessage='Evaluation status' />
            </Tooltip>
          }>
            <Icon name='question' />
          </OverlayTrigger>
        </th>
        <th className='text-center'>
          <OverlayTrigger placement='top' overlay={
            <Tooltip id='memoryExceeded'>
              <FormattedMessage id='app.submissions.testResultsTable.memoryExceeded' defaultMessage='Memory limit' />
            </Tooltip>
          }>
            <Icon name='stack-overflow' />
          </OverlayTrigger>
        </th>
        <th className='text-center'>
          <OverlayTrigger placement='top' overlay={
            <Tooltip id='timeExceeded'>
              <FormattedMessage id='app.submissions.testResultsTable.timeExceeded' defaultMessage='Time limit' />
            </Tooltip>
          }>
            <Icon name='rocket' />
          </OverlayTrigger>
        </th>
      </tr>
    </thead>
    <tbody>
    {results.map(({
      id,
      testName,
      score,
      status,
      memoryExceeded,
      timeExceeded,
      message,
      timeRatio,
      memoryRatio
    }) => (
      <tr key={testName}>
        {getTickORCheckTableCell(score === 1)}
        <td>
          {testName}
        </td>
        <td className='text-center'>
          <FormattedNumber value={score} style='percent' />
        </td>
        <td className='text-center'>
          {status === 'OK' && (
            <OverlayTrigger placement='bottom' overlay={
              <Tooltip id={`status-${id}`}>
                <FormattedMessage id='app.submissions.testResultsTable.statusOK' defaultMessage='OK' />
              </Tooltip>
            }>
              <Icon name='smile-o' />
            </OverlayTrigger>
          )}
          {status === 'SKIPPED' && (
            <OverlayTrigger placement='bottom' overlay={
              <Tooltip id={`status-${id}`}>
                <FormattedMessage id='app.submissions.testResultsTable.statusSkipped' defaultMessage='Skipped' />
              </Tooltip>
            }>
              <Icon name='meh-o' />
            </OverlayTrigger>
          )}
          {status === 'FAILED' && (
            <OverlayTrigger placement='bottom' overlay={
              <Tooltip id={`status-${id}`}>
                <FormattedMessage id='app.submissions.testResultsTable.statusFailed' defaultMessage='Failed' />
              </Tooltip>
            }>
              <Icon name='frown-o' />
            </OverlayTrigger>
          )}
        </td>
        {memoryRatio !== null ? getTickORCheckTableCellOverlay(memoryExceeded === false, memoryRatio) : getTickORCheckTableCell(memoryExceeded === false)}
        {timeRatio !== null ? getTickORCheckTableCellOverlay(timeExceeded === false, timeRatio) : getTickORCheckTableCell(timeExceeded === false)}
      </tr>
    ))}
    </tbody>
  </Table>
);

TestResultsTable.propTypes = {
  results: PropTypes.arrayOf(PropTypes.shape({
    testName: PropTypes.string
  })).isRequired
};

export default TestResultsTable;
