import React, { PropTypes } from 'react';
import { FormattedMessage, FormattedDate } from 'react-intl';
import prettyBytes from 'pretty-bytes';
import prettyMs from 'pretty-ms';
import { Table } from 'react-bootstrap';
import Box from '../../AdminLTE/Box';

const ReferenceSolutionsEvaluationsResults = ({
  results,
  testId
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
          <th><FormattedMessage id='app.referenceSolutionsEvaluations.memory' defaultMessage='Measured memory' /></th>
          <th><FormattedMessage id='app.referenceSolutionsEvaluations.time' defaultMessage='Measured time' /></th>
        </tr>
      </thead>
      <tbody>
        {results.map((result, i) => {
          const testStats = result.evaluation.testResults.find(test => test.id === testId);
          // @todo: use task stats of the test
          return (
            <tr key={i}>
              <td>{result.referenceSolution.description}</td>
              <td><FormattedDate value={result.evaluation.evaluatedAt * 1000} /></td>
              <td>{prettyBytes(-1)}</td>
              <td>{prettyMs(-1)}</td>
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
