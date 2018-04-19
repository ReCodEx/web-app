import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import Box from '../../widgets/Box';

const JudgeLogs = ({ testResults }) =>
  <Box
    title={
      <FormattedMessage
        id="app.evaluationDetail.judgeLogs.title"
        defaultMessage="Judge Logs"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={false}
  >
    <Table responsive hover>
      <thead>
        <tr>
          <th>
            <FormattedMessage
              id="app.evaluationDetail.judgeLogs.testName"
              defaultMessage="Test Name"
            />
          </th>
          <th>
            <FormattedMessage
              id="app.evaluationDetail.judgeLogs.output"
              defaultMessage="Output"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        {testResults.map((result, i) =>
          <tr key={i}>
            <td>
              {result.testName}
            </td>
            <td>
              <code>
                {result.judgeOutput}
              </code>
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </Box>;

JudgeLogs.propTypes = {
  testResults: PropTypes.array.isRequired
};

export default JudgeLogs;
