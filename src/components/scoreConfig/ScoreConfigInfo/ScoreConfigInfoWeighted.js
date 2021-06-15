import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import InsetPanel from '../../widgets/InsetPanel';
import { safeGet, EMPTY_OBJ, arrayToObject } from '../../../helpers/common';

const ScoreConfigInfoWeighted = ({ scoreConfig, testResults }) => {
  const results =
    testResults &&
    arrayToObject(
      testResults,
      ({ testName }) => testName,
      ({ score }) => score
    );

  const weightsObj = safeGet(scoreConfig, ['config', 'testWeights'], EMPTY_OBJ);
  const weights = Object.keys(weightsObj)
    .sort()
    .map(test => ({ test, weight: weightsObj[test] }));
  const weightsSum = weights.reduce((acc, { weight }) => acc + weight, 0);
  const testsSum = results && weights.reduce((acc, { test, weight }) => acc + weight * results[test], 0);
  const totalScore = weightsSum !== 0 ? Math.round((testsSum * 1000) / weightsSum) / 1000 : '?';

  return (
    <div>
      <h4>
        <FormattedMessage id="app.scoreCalculators.weighted.caption" defaultMessage="Weighted arithmetic mean" />
      </h4>
      <p>
        <FormattedMessage
          id="app.scoreCalculators.weighted.description"
          defaultMessage="The overall correctness is computed as weighted average of the individual test results."
        />
      </p>

      {weights.length > 0 ? (
        <Table bordered striped hover>
          <thead>
            <tr>
              <th>
                <FormattedMessage id="app.scoreConfigInfoWeighted.test" defaultMessage="Test" />
              </th>
              <th>
                <FormattedMessage id="app.scoreConfigInfoWeighted.score" defaultMessage="Test Correctness" />
              </th>
              <th>
                <FormattedMessage id="app.scoreConfigInfoWeighted.weight" defaultMessage="Weight" />
              </th>
            </tr>
          </thead>
          <tbody>
            {weights.map(({ test, weight }) => (
              <tr key={test}>
                <td className="text-nowrap">{test}</td>
                <td>{results && results[test] !== undefined ? results[test] : '?'}</td>
                <td>{weight}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>
                <FormattedMessage id="app.scoreConfigInfoWeighted.totals" defaultMessage="Totals" />
              </th>
              <th>{testsSum}</th>
              <th>
                {weightsSum}
                <span className="float-right">= {totalScore}</span>
              </th>
            </tr>
          </tfoot>
        </Table>
      ) : (
        <InsetPanel>
          <FormattedMessage
            id="app.scoreConfigInfoWeighted.noTests"
            defaultMessage="There are no test weights specified in the configuration."
          />
        </InsetPanel>
      )}
    </div>
  );
};

ScoreConfigInfoWeighted.propTypes = {
  scoreConfig: PropTypes.object,
  testResults: PropTypes.array,
};

export default ScoreConfigInfoWeighted;
