import React from 'react';
import PropTypes from 'prop-types';
import { Table, Well } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { safeGet, EMPTY_OBJ } from '../../../helpers/common';

const ScoreConfigInfoWeighted = ({ scoreConfig }) => {
  const weightsObj = safeGet(scoreConfig, ['config', 'testWeights'], EMPTY_OBJ);
  const weights = Object.keys(weightsObj)
    .sort()
    .map(test => ({ test, weight: weightsObj[test] }));

  return (
    <div>
      <h4>
        <FormattedMessage id="app.scoreConfigInfoWeighted.title" defaultMessage="Weighted arithmetic mean" />
      </h4>
      <p>
        <FormattedMessage
          id="app.scoreConfigInfoWeighted.description"
          defaultMessage="The overall correctness is computed as weighted average of the individual test results. The weights for individual tests are displayed below."
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
                <FormattedMessage id="app.scoreConfigInfoWeighted.weight" defaultMessage="Weight" />
              </th>
            </tr>
          </thead>
          <tbody>
            {weights.map(({ test, weight }) => (
              <tr key={test}>
                <td className="text-nowrap">{test}</td>
                <td>{weight}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <Well>
          <FormattedMessage
            id="app.scoreConfigInfoWeighted.noTests"
            defaultMessage="There are no test weights specified in the configuration."
          />
        </Well>
      )}
    </div>
  );
};

ScoreConfigInfoWeighted.propTypes = {
  scoreConfig: PropTypes.object,
};

export default ScoreConfigInfoWeighted;
