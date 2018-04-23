import { handleActions } from 'redux-actions';
import { change } from 'redux-form';

import factory, { initialState } from '../helpers/resourceManager';
import { encodeNumId } from '../../helpers/common';

/**
 * Create actions & reducer
 */

const resourceName = 'exerciseConfigs';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/exercises/${id}/config`
});

export const fetchExerciseConfig = actions.fetchResource;
export const fetchExerciseConfigIfNeeded = actions.fetchOneIfNeeded;
export const setExerciseConfig = actions.updateResource;

/*
 * Smart form-filling algorithm which attempts to match file names to test names automatically.
 */

// Get all files which share same prefix and suffix (and still have unique root part in between).
// If more than one file have the same root name, null is return instead.
// Candidates are returned as object, keys are root names, values are file names.
const prepareFileCandidates = (prefix, suffix, files) => {
  let collisions = false; // whethere there were root name collisions
  const candidates = {};
  files
    .filter(
      ({ name }) =>
        name.startsWith(prefix) &&
        name.endsWith(suffix) &&
        name.length > prefix.length + suffix.length
    )
    .forEach(file => {
      const root = file.name
        .substr(prefix.length, file.name.length - prefix.length - suffix.length)
        .toLowerCase(); // the root is what is left of name after removing prefix and suffix
      collisions = collisions || candidates[root] !== undefined;
      candidates[root] = file.name;
    });

  return collisions || Object.keys(candidates).length === 0 ? null : candidates;
};

// Create forward and reverse index { testId -> files } and { file -> testIds }
// where matching is based on whether a root file name is a substring of a test name.
const prepareBasicMatching = (candidates, tests) => {
  // Prepare empty map testId -> list of files...
  const testFiles = {};
  tests.forEach(test => {
    testFiles[test.id] = [];
  });

  // Prepare map file -> list of testIds and fill also testFiles map...
  const fileTests = {};
  for (const root in candidates) {
    const file = candidates[root]; // full file name for given root name
    fileTests[file] = tests
      .filter(
        ({ name }) => name.toLowerCase().indexOf(root) >= 0 // indexOf >= 0 means the root was found as substring
      )
      .map(test => test.id); // list of test IDs which contain this root name as a substring
    fileTests[file].forEach(testId => testFiles[testId].push(file)); // reverse index
  }

  return { fileTests, testFiles };
};

const freezeAssignmentsForExactMatches = ({ fileTests, testFiles }) => {
  let changed = false;

  // Find test with exact file match (only one file candidate) ...
  for (const testId in testFiles) {
    if (Array.isArray(testFiles[testId]) && testFiles[testId].length === 1) {
      const file = testFiles[testId][0]; // file to be assigned to this test
      fileTests[file].forEach(tid => {
        if (Array.isArray(testFiles[tid])) {
          testFiles[tid] = testFiles[tid].filter(f => f !== file); // remove assigned file from all other tests
        }
      });
      delete fileTests[file]; // assigned file should no longer be available
      testFiles[testId] = file; // change this record to string => freeze the assignment
      changed = true;
    }
  }

  // Find files with exactly one matching test ...
  for (const file in fileTests) {
    if (fileTests[file].length === 1) {
      const testId = fileTests[file][0]; // test being assigned
      testFiles[testId].forEach(f => {
        fileTests[f] = fileTests[f].filter(tid => tid !== testId); // remove test from all other files
      });
      delete fileTests[file]; // assigned file should no longer be available
      testFiles[testId] = file; // change this record to string => freeze the assignment
      changed = true;
    }
  }

  return changed;
};

// Compute penalizations for given matching and finalize testFiles (since they are the result).
const computeMatchingPenaltyAndFinalize = ({ fileTests, testFiles }) => {
  let score = 0;

  // Penalize for each not-matched or mismatched test.
  for (const testId in testFiles) {
    if (Array.isArray(testFiles[testId])) {
      score += testFiles[testId].length === 0 ? 2 : 10; // no matches -> small penalty, mismatch -> huge penalty
      testFiles[testId] = null;
    }
  }

  // Penalize all files not matched at all (but which were in the initial candidate set).
  for (const file in fileTests) {
    if (fileTests[file].length === 0) {
      ++score;
    }
  }

  return score;
};

// Compute best possible matching between tests and files for given prefix and suffix.
const computeMatching = (prefix, suffix, firstTestId, tests, files) => {
  const candidates = prepareFileCandidates(prefix, suffix, files);
  if (!candidates) {
    return null;
  }

  const matching = prepareBasicMatching(candidates, tests);
  while (freezeAssignmentsForExactMatches(matching)); // empty body

  if (
    !matching.testFiles[firstTestId] ||
    Array.isArray(matching.testFiles[firstTestId])
  ) {
    // First test (template) file was not matched or was mismatched ...
    return null;
  }
  const penalty = computeMatchingPenaltyAndFinalize(matching);

  return { penalty, testFiles: matching.testFiles };
};

// Compute indices where are good split points for a string using Given regex identifies separators.
const computePossibleSplitPoints = (str, regex) => {
  const res = [0];
  let lastIdx;
  let offset = 0;
  let s = str;
  while ((lastIdx = s.search(regex)) >= 0) {
    if (lastIdx > 0 || offset === 0) {
      res.push(offset + lastIdx);
      s = s.substr(++lastIdx); // new search must skip at least first characeter of the separator
      offset += lastIdx;
    } else {
      // separator found at beginning -> it is a continuation of previous separator
      ++offset;
      s = s.substr(1);
    }
  }
  res.push(str.length);
  return res;
};

// Compute a set of all possible prefix-suffix pairs from given fileName.
// Each continuous sequence of non-alphanumeric characters is a possible separation point to start/end a suffix/prefix.
const computePossiblePrefixesSuffixes = fileName => {
  const splitPoints = computePossibleSplitPoints(fileName, /[^a-z0-9]/);
  const res = [];
  splitPoints.forEach(left =>
    splitPoints.filter(right => left < right).forEach(right =>
      res.push({
        prefix: fileName.substr(0, left),
        suffix: fileName.substr(right)
      })
    )
  );
  return res;
};

//
const bestMatchFileNames = (fileName, firstTestId, tests, files) =>
  computePossiblePrefixesSuffixes(
    fileName
  ).reduce((bestMatching, { prefix, suffix }) => {
    const matching = computeMatching(prefix, suffix, firstTestId, tests, files);
    return matching !== null &&
    (bestMatching === null || bestMatching.penalty > matching.penalty)
      ? matching // a better matching was found
      : bestMatching;
  }, null);

//
const prepareTransformations = (template, firstTestId, tests, files) => {
  const transformations = {};

  // Smart renaming of single file variables ...
  ['stdin-file', 'expected-output'].filter(f => template[f]).forEach(field => {
    const matches = bestMatchFileNames(
      template[field],
      firstTestId,
      tests,
      files
    );

    if (matches) {
      transformations[field] = testId => matches.testFiles[testId] || undefined;
    }
  });

  // Input files
  if (template['input-files'] && template['input-files'].length > 0) {
    // Matches acts as template for input files
    const inputFiles = template['input-files'].map(({ name, file }) => ({
      name,
      file,
      matches: bestMatchFileNames(file, firstTestId, tests, files) // instead of one file, it holds all files for all tests
    }));
    transformations['input-files'] = testId =>
      inputFiles
        .map(({ name, file, matches }) => ({
          // convert the template into an instance by selecting appropriate file
          name,
          file: matches ? matches.testFiles[testId] || undefined : file // apply matches if possible, use original file name if no matching was established
        }))
        .filter(({ file }) => file); // remove records which do not have apropriate file
  }

  // Compilation extra files ...
  // TODO fixme !!!
  const compilation = {}; // matches for all environments
  for (const envId in template.compilation) {
    compilation[envId] = template.compilation[envId][
      'extra-files'
    ].map(({ name, file }) => ({
      name,
      file,
      matches: bestMatchFileNames(file, firstTestId, tests, files)
    }));
    if (template.compilation[envId].entryPoint !== undefined) {
      compilation[envId].entryPoint = template.compilation[envId].entryPoint;
    }
  }

  transformations.compilation = testId => {
    const transformed = {};
    for (const envId in compilation) {
      transformed[envId] = {
        'extra-files': compilation[envId]
          .map(({ name, file, matches }) => ({
            name,
            file: (matches && matches.testFiles[testId]) || file
          }))
          .filter(({ file }) => file) // remove records which do not have apropriate file
      };
      if (compilation[envId].entryPoint !== undefined) {
        transformed[envId].entryPoint = compilation[envId].entryPoint;
      }
    }
    return transformed;
  };

  return transformations;
};

// Get test config record from the redux-form store
const getTestConfig = ({ form }, formName, testKey) =>
  form[formName].values.config[testKey] ||
  form[formName].initial.config[testKey] ||
  null;

/*
 * Main filling function. It fills all tests based on the first test template.
 */
export const smartFillExerciseConfigForm = (
  formName,
  firstTestId,
  tests,
  files
) => (dispatch, getState) => {
  const state = getState();
  const firstTestKey = encodeNumId(firstTestId);
  const template = getTestConfig(state, formName, firstTestKey);
  const transformations = prepareTransformations(
    template,
    firstTestId,
    tests,
    files
  );
  return Promise.all(
    tests.filter(({ id }) => encodeNumId(id) !== firstTestKey).map(test => {
      const testKey = encodeNumId(test.id);
      return Promise.all(
        [
          'stdin-file',
          'input-files',
          'run-args',
          'expected-output',
          'useOutFile',
          'actual-output',
          'useCustomJudge',
          'judge-type',
          'custom-judge',
          'judge-args',
          'extra-files'
        ]
          .map(field => {
            const value = transformations[field]
              ? transformations[field](test.id, template[field])
              : template[field];
            return value !== undefined
              ? dispatch(
                  change(formName, ['config', testKey, field].join('.'), value)
                )
              : undefined;
          })
          .filter(d => d)
      );
    })
  );
};

const reducer = handleActions(reduceActions, initialState);
export default reducer;
