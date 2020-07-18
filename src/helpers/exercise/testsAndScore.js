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

/**
 * Prepare initial values for EditTestsForm of the exercise.
 */
export const getTestsInitValues = (exerciseTests, scoreConfig, locale) => {
  const calculator = (scoreConfig && scoreConfig.calculator) || UNIFORM_ID;
  const sortedTests = exerciseTests.sort((a, b) => a.name.localeCompare(b.name, locale));

  const tests = sortedTests.map(test => ({
    id: test.id,
    name: test.name,
  }));
  if (calculator === WEIGHTED_ID) {
    const testWeights = (scoreConfig.config && scoreConfig.config.testWeights) || EMPTY_OBJ;
    tests.forEach(test => (test.weight = testWeights[test.name] !== undefined ? Number(testWeights[test.name]) : 100));
  }

  const formValues = { tests, calculator };
  if (calculator === UNIVERSAL_ID && scoreConfig.config) {
    formValues.config = scoreConfig.config;
  }
  return formValues;
};

/**
 * Gather data of EditTestsForm and prepare them to be sent to Tests endpoint and ScoreConfig endpoint.
 */
export const transformTestsValues = ({ tests }) =>
  tests.map(({ id, name }) => (id && id >= 0 ? { id, name: name.trim() } : { name: name.trim() }));

/**
 * Convert tests (in form data format -- as an array of { id, name }) into an object indexed by IDs
 * (i.e., object where ids are keys and names are values).
 * @param {Object[]} tests
 * @returns {Object}
 */
export const createTestNameIndex = tests =>
  arrayToObject(
    tests,
    ({ id }) => id,
    ({ name }) => name
  );

/**
 * Generate weights compatible with uniform config (each text has weight 100).
 * @param {Object[]} tests
 */
const generateUniformWeights = tests =>
  arrayToObject(
    tests,
    ({ name }) => name,
    () => 100
  );

const sumWeights = weights => Object.values(weights).reduce((res, x) => res + x, 0);

const areWeightsTheSame = weights => {
  const values = Object.values(weights);
  return values.every(value => value === values[0]);
};

// tmp function used for config cnostruction
const _node = (type, valueName = 'children') => value => ({ type, [valueName]: value });
const _avg = _node('avg');
const _div = _node('div');
const _mul = _node('mul');
const _sum = _node('sum');
const _test = _node('test-result', 'test');
const _value = _node('value', 'value');

const weightsToUniversalConfig = weights =>
  Object.keys(weights).length > 0
    ? areWeightsTheSame(weights)
      ? // normal average
        _avg(Object.keys(weights).map(_test))
      : // weighted average (sum of tests divided by sum of weights)
        _div([_sum(Object.keys(weights).map(name => _mul([weights[name], _test(name)]))), sumWeights(weights)])
    : _value(1); // fallback for no weights - at least valid config must be generated

/**
 * Load weights from the form data based on the original calculator
 * @param {Object[]} tests List of tests as yielded by transformTestsValues of tests.js
 * @param {string} originalCalculator Name of the calculator used
 * @param {Object} formData
 * @param {AstNode} astRoot extra data present if the config is made in AST editor
 */
const loadWeights = (tests, originalCalculator, formData, astRoot) => {
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

  if (originalCalculator === UNIVERSAL_ID) {
    // Attempt to detect pattern of (weighted) average in universal (AST) configuration
    // const config = loadUniversalConfig(tests, originalCalculator, formData, astRoot);
    // TODO
    return generateUniformWeights(tests);
  }

  // In any other case, the weights cannot be loaded -> fill in the uniform weights
  return generateUniformWeights(tests);
};

/**
 * Load universal configuration (AST tree) based on the original calculator
 * @param {Object[]} tests List of tests as yielded by transformTestsValues of tests.js
 * @param {string} originalCalculator Name of the calculator used
 * @param {Object} formData
 * @param {AstNode} astRoot extra data present if the config is made in AST editor
 */
const loadUniversalConfig = (tests, originalCalculator, formData, astRoot) => {
  if (originalCalculator === UNIVERSAL_ID) {
    return astRoot ? astRoot.serialize(createTestNameIndex(formData.tests)) : formData.config;
  }

  return weightsToUniversalConfig(loadWeights(tests, originalCalculator, formData, astRoot));
};

/**
 * Transform the data of the form into score config data to be sent over to the server.
 * @param {Object[]} tests List of tests as yielded by transformTestsValues of tests.js
 * @param {string} originalCalculator Name of the calculator used
 * @param {Object} formData
 * @param {AstNode} extraData extra data present if the config is made in AST editor
 */
export const transformScoreConfig = (tests, originalCalculator, formData, extraData) => {
  const scoreCalculator = formData.calculator || UNIFORM_ID;

  if (scoreCalculator === UNIFORM_ID) {
    return null; // uniform calculator has no config
  }

  if (scoreCalculator === WEIGHTED_ID) {
    const testWeights = loadWeights(tests, originalCalculator, formData, extraData);
    return { testWeights };
  }

  if (scoreCalculator === UNIVERSAL_ID) {
    return loadUniversalConfig(tests, originalCalculator, formData, extraData);
  }

  throw new Error(`Unknown score calculator ${scoreCalculator}.`);
};
