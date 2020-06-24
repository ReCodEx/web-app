import React from 'react';
import { FormattedMessage } from 'react-intl';

import { arrayToObject, EMPTY_OBJ } from '../common';

export const UNIFORM_ID = 'uniform';
export const WEIGHTED_ID = 'weighted';
export const UNIVERSAL_ID = 'universal';

export const KNOWN_CALCULATORS = [UNIFORM_ID, WEIGHTED_ID, UNIVERSAL_ID];

export const SCORE_CALCULATOR_CAPTIONS = {
  [UNIFORM_ID]: <FormattedMessage id="app.scoreCalculators.uniform.caption" defaultMessage="Arithmetic average" />,
  [WEIGHTED_ID]: (
    <FormattedMessage id="app.scoreCalculators.weighted.caption" defaultMessage="Weighted arithmetic mean" />
  ),
  [UNIVERSAL_ID]: <FormattedMessage id="app.scoreCalculators.universal.caption" defaultMessage="Custom expression" />,
};

export const SCORE_CALCULATOR_DESCRIPTIONS = {
  [UNIFORM_ID]: (
    <FormattedMessage
      id="app.scoreCalculators.uniform.description"
      defaultMessage="The overall correctness is computed as a simple arithmetic average of the individual test results."
    />
  ),
  [WEIGHTED_ID]: (
    <FormattedMessage
      id="app.scoreCalculators.weighted.description"
      defaultMessage="The overall correctness is computed as weighted average of the individual test results."
    />
  ),
  [UNIVERSAL_ID]: (
    <FormattedMessage
      id="app.scoreCalculators.universal.description"
      defaultMessage="The correcntess is computed by a custom expression that takes test results as an input."
    />
  ),
};

export const augmentTestInitValuesWithScoreConfig = (formValues, scoreConfig) => {
  const calculator = (scoreConfig && scoreConfig.calculator) || UNIFORM_ID;
  formValues.calculator = calculator;

  if (calculator === WEIGHTED_ID) {
    const testWeights = (scoreConfig.config && scoreConfig.config.testWeights) || EMPTY_OBJ;
    formValues.tests.forEach(
      test => (test.weight = testWeights[test.name] !== undefined ? Number(testWeights[test.name]) : 100)
    );
  } else if (scoreConfig.config) {
    formValues.config = scoreConfig.config;
  }

  return formValues;
};

const generateUniformWeights = tests =>
  arrayToObject(
    tests,
    ({ name }) => name,
    () => 100
  );

/**
 * Load weights from the form data based on the original calculator
 * @param {array} tests List of tests as yielded by transformTestsValues of tests.js
 * @param {string} originalCalculator Name of the calculator used
 * @param {object} formData
 */
const loadWeights = (tests, originalCalculator, formData) => {
  if (originalCalculator === WEIGHTED_ID) {
    const weights = arrayToObject(
      formData.tests,
      ({ name }) => name.trim(),
      ({ weight = 100 }) => Number(weight)
    );

    // if some test weights are missing, fill them with defaults
    tests.forEach(({ name }) => {
      if (weights[name] === undefined) {
        weights[name] = 100;
      }
    });

    return weights;
  }

  if (originalCalculator === UNIFORM_ID) {
    // TODO
  }

  // In any other case, the weights cannot be loaded -> fill in the uniform weights
  return generateUniformWeights(tests);
};

/**
 * Transform the data of the form into score config data to be sent over to the server.
 * @param {array} tests List of tests as yielded by transformTestsValues of tests.js
 * @param {string} originalCalculator Name of the calculator used
 * @param {object} formData
 */
export const transformScoreConfig = (tests, originalCalculator, formData) => {
  const scoreCalculator = formData.calculator || UNIFORM_ID;

  if (scoreCalculator === UNIFORM_ID) {
    return null; // uniform calculator has no config
  }

  if (scoreCalculator === WEIGHTED_ID) {
    const testWeights = loadWeights(tests, originalCalculator, formData);
    return { testWeights };
  }

  if (scoreCalculator === UNIVERSAL_ID) {
    // TODO
    return { type: 'value', value: 1 };
  }

  throw new Error(`Unknown score calculator ${scoreCalculator}.`);
};
