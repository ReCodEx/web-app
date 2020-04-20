import yaml from 'js-yaml';
import { EMPTY_OBJ } from '../../helpers/common';

/**
 * Prepare initial values for EditTestsForm of the exercise.
 */
export const getTestsInitValues = (exerciseTests, scoreConfig, locale) => {
  const jsonScoreConfig = scoreConfig && scoreConfig.config && yaml.safeLoad(scoreConfig.config);
  const testWeights = jsonScoreConfig.testWeights || EMPTY_OBJ;
  const sortedTests = exerciseTests.sort((a, b) => a.name.localeCompare(b.name, locale));

  const res = [];
  let allWeightsSame = true;
  let lastWeight = null;
  for (const test of sortedTests) {
    const testWeight = testWeights[test.name] !== undefined ? Number(testWeights[test.name]) : 100;
    if (lastWeight !== null && testWeight !== lastWeight) {
      allWeightsSame = false;
    }
    lastWeight = testWeight;
    res.push({
      id: test.id,
      name: test.name,
      weight: testWeight,
    });
  }

  return {
    isUniform: allWeightsSame,
    tests: res,
  };
};

/**
 * Gather data of EditTestsForm and prepare them to be sent to Tests endpoint and ScoreConfig endpoint.
 */
export const transformTestsValues = formData => {
  const uniformScore = formData.isUniform === true || formData.isUniform === 'true';
  const scoreConfigData = {
    testWeights: {},
  };
  const tests = [];

  for (const test of formData.tests) {
    const testName = test.name.trim();
    const testWeight = uniformScore ? 100 : Number(test.weight);
    scoreConfigData.testWeights[testName] = testWeight;

    tests.push(
      test.id
        ? {
            id: test.id,
            name: testName,
          }
        : {
            name: testName,
          }
    );
  }

  return {
    tests,
    scoreCalculator: 'weighted', // will be fixed once other calculators are implemented
    scoreConfig: yaml.safeDump(scoreConfigData),
  };
};
