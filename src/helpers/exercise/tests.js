import yaml from 'js-yaml';
import { EMPTY_OBJ } from '../../helpers/common';

/**
 * Prepare initial values for EditTestsForm of the exercise.
 */
export const getTestsInitValues = (exerciseTests, scoreConfig, locale) => {
  const jsonScoreConfig = yaml.safeLoad(scoreConfig);
  const testWeights = jsonScoreConfig.testWeights || EMPTY_OBJ;
  const sortedTests = exerciseTests.sort((a, b) =>
    a.name.localeCompare(b.name, locale)
  );

  let res = [];
  let allWeightsSame = true;
  let lastWeight = null;
  for (const test of sortedTests) {
    const testWeight =
      testWeights[test.name] !== undefined
        ? Number(testWeights[test.name])
        : 100;
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
  const uniformScore =
    formData.isUniform === true || formData.isUniform === 'true';
  let scoreConfigData = {
    testWeights: {},
  };
  let tests = [];

  for (const test of formData.tests) {
    const testWeight = uniformScore ? 100 : Number(test.weight);
    scoreConfigData.testWeights[test.name] = testWeight;

    tests.push(
      test.id
        ? {
            id: test.id,
            name: test.name,
          }
        : {
            name: test.name,
          }
    );
  }

  return {
    tests,
    scoreConfig: yaml.safeDump(scoreConfigData),
  };
};
