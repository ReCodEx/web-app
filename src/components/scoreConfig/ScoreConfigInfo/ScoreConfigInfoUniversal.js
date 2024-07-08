import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import ScoreConfigUniversalExpression from '../ScoreConfigUniversalExpression';
import { Ast } from '../../../helpers/exercise/scoreAst.js';
import { arrayToObject } from '../../../helpers/common.js';
import InsetPanel from '../../widgets/InsetPanel';

const createAst = lruMemoize((config, testResults) => {
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

    <InsetPanel>
      <ScoreConfigUniversalExpression ast={createAst(scoreConfig.config, testResults)} editable={false} />
    </InsetPanel>
  </div>
);

ScoreConfigInfoUniversal.propTypes = {
  scoreConfig: PropTypes.object,
  testResults: PropTypes.array,
};

export default ScoreConfigInfoUniversal;
