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

const TestResultsTable = ({ results }) => (
  <Table responsive>
    <thead>
      <tr>
        <th></th>
        <th><FormattedMessage id='app.submissions.testResultsTable.testName' defaultMessage='Test name' /></th>
        <th></th>
        <th className='text-center'>
          <OverlayTrigger placement='bottom' overlay={
            <Tooltip id='memoryExceeded'>
              <FormattedMessage id='app.submissions.testResultsTable.memoryExceeded' defaultMessage='Memory limit' />
            </Tooltip>
          }>
            <Icon name='stack-overflow' />
          </OverlayTrigger>
        </th>
        <th className='text-center'>
          <OverlayTrigger placement='bottom' overlay={
            <Tooltip id='timeExceeded'>
              <FormattedMessage id='app.submissions.testResultsTable.timeExceeded' defaultMessage='Time limit' />
            </Tooltip>
          }>
            <span><Icon name='clock-o' /> <Icon name='rocket' /></span>
          </OverlayTrigger>
        </th>
      </tr>
    </thead>
    <tbody>
    {results.map(({
      testName,
      score,
      memoryExceeded,
      timeExceeded,
      message
    }) => (
      <tr key={testName}>
        {getTickORCheckTableCell(score === 1)}
        <td>
          {testName}
        </td>
        <td className='text-center'>
          <FormattedNumber value={score} style='percent' />
        </td>
        {getTickORCheckTableCell(memoryExceeded === false)}
        {getTickORCheckTableCell(timeExceeded === false)}
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
