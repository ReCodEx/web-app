import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Well } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import ScoreConfigUniversalExpression from '../ScoreConfigUniversalExpression';
import { Ast } from '../../../helpers/exercise/scoreAst';
import { arrayToObject } from '../../../helpers/common';

const createAst = defaultMemoize((config, testResults) => {
  const results =
    testResults &&
    arrayToObject(
      testResults,
      ({ testName }) => testName,
      ({ score }) => score
    );

  const ast = new Ast();
  ast.deserialize(config);
  ast.evaluate(results);
  return ast;
});

const ScoreConfigInfoUniversal = ({ scoreConfig, testResults }) => (
  <div>
    <h4>
      <FormattedMessage id="app.scoreCalculators.universal.caption" defaultMessage="Custom expression" />
    </h4>
    <p>
      <FormattedMessage
        id="app.scoreCalculators.universal.description"
        defaultMessage="The correcntess is computed by a custom expression that takes test results as inputs."
      />
    </p>

    <Well>
      <ScoreConfigUniversalExpression ast={createAst(scoreConfig.config, testResults)} editable={false} />
    </Well>
  </div>
);

ScoreConfigInfoUniversal.propTypes = {
  scoreConfig: PropTypes.object,
  testResults: PropTypes.array,
};

export default ScoreConfigInfoUniversal;
