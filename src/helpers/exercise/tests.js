import { augmentTestInitValuesWithScoreConfig } from './score';

/**
 * Prepare initial values for EditTestsForm of the exercise.
 */
export const getTestsInitValues = (exerciseTests, scoreConfig, locale) => {
  const sortedTests = exerciseTests.sort((a, b) => a.name.localeCompare(b.name, locale));
  const tests = sortedTests.map(test => ({
    id: test.id,
    name: test.name,
  }));
  return augmentTestInitValuesWithScoreConfig({ tests }, scoreConfig);
};

/**
 * Gather data of EditTestsForm and prepare them to be sent to Tests endpoint and ScoreConfig endpoint.
 */
export const transformTestsValues = ({ tests }) =>
  tests.map(({ id, name }) => (id ? { id, name: name.trim() } : { name: name.trim() }));
