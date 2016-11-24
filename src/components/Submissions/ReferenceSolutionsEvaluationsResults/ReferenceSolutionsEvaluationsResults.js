import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import prettyBytes from 'pretty-bytes';
import prettyMs from 'pretty-ms';
import { Table } from 'react-bootstrap';
import Box from '../../AdminLTE/Box';

const ReferenceSolutionsEvaluationsResults = ({
  results,
  testId,
  taskId
}) => (
  <Box
    isOpen={false}
    collapsable
    solid
    noPadding
    type='warning'
    title={<FormattedMessage id='app.referenceSolutionsEvaluations.title' defaultMessage="Reference solutions' evaluations" />}>
    <Table condensed hover responsive striped>
      <thead>
        <tr>
          <th><FormattedMessage id='app.referenceSolutionsEvaluations.description' defaultMessage='Description' /></th>
          <th><FormattedMessage id='app.referenceSolutionsEvaluations.evaluatedAt' defaultMessage='Evaluated on' /></th>
          <th><FormattedMessage id='app.referenceSolutionsEvaluations.memory' defaultMessage='Memory' /></th>
          <th><FormattedMessage id='app.referenceSolutionsEvaluations.time' defaultMessage='Time' /></th>
        </tr>
      </thead>
      <tbody>
        {results
          .filter((result) => result.evaluationStatus === 'done' && result.evaluation)
          .map((result, i) => {
            // find the specific test
            const testStats = result.evaluation.testResults.find(test => test.testName === testId);
            if (!testStats) {
              return null;
            }

            // find the specific task of the test
            const taskStats = testStats.tasks.find(task => task.id === taskId);
            if (!taskStats) {
              return null;
            }

            return (
              <tr key={i}>
                <td>{result.referenceSolution.description}</td>
                <td><FormattedDate value={result.evaluation.evaluatedAt * 1000} /></td>
                <td>{prettyBytes(taskStats.usedMemory)}</td>
                <td>{prettyMs(taskStats.usedTime * 1000)}</td>
              </tr>
            );
          })}
      </tbody>
    </Table>
  </Box>
);

ReferenceSolutionsEvaluationsResults.propTypes = {
  results: PropTypes.array.isRequired,
  testId: PropTypes.string.isRequired,
  taskId: PropTypes.string.isRequired
};

export default ReferenceSolutionsEvaluationsResults;
