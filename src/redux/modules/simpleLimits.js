import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';
import { change } from 'redux-form';

/**
 * Create actions & reducer
 */

const resourceName = 'simpleLimits';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => id
});

export const additionalActionTypes = {
  CLONE_VERTICAL: 'recodex/simpleLimits/CLONE_VERTICAL',
  CLONE_HORIZONTAL: 'recodex/simpleLimits/CLONE_HORIZONTAL',
  CLONE_ALL: 'recodex/simpleLimits/CLONE_ALL'
};

export const endpointDisguisedAsIdFactory = ({
  exerciseId,
  runtimeEnvironmentId
}) => `/exercises/${exerciseId}/environment/${runtimeEnvironmentId}/limits`;

export const fetchExerciseEnvironmentSimpleLimits = (
  exerciseId,
  runtimeEnvironmentId
) =>
  actions.fetchResource(
    endpointDisguisedAsIdFactory({ exerciseId, runtimeEnvironmentId })
  );

export const fetchExerciseEnvironmentSimpleLimitsIfNeeded = (
  exerciseId,
  runtimeEnvironmentId
) =>
  actions.fetchOneIfNeeded(
    endpointDisguisedAsIdFactory({ exerciseId, runtimeEnvironmentId })
  );

export const editEnvironmentSimpleLimits = (
  exerciseId,
  runtimeEnvironmentId,
  data
) =>
  actions.updateResource(
    endpointDisguisedAsIdFactory({ exerciseId, runtimeEnvironmentId }),
    data
  );

/*
const isSimpleLimitsForm = ({ registeredFields }, testName) =>
  registeredFields &&
  registeredFields.hasOwnProperty(`limits.${testName}.wall-time`) &&
  registeredFields.hasOwnProperty(`limits.${testName}.memory`);

const getAllSimpleLimitsFormNames = ({ form }, testName) =>
  Object.keys(form).filter(name => isSimpleLimitsForm(form[name], testName));

const getAllTestNames = ({ form }, formName) =>
  Object.keys(form[formName].registeredFields)
    .map(name => {
      const firstDot = name.indexOf('.');
      const lastDot = name.lastIndexOf('.');
      return name.substring(firstDot + 1, lastDot);
    })
    .reduce((acc, name) => (acc.indexOf(name) >= 0 ? acc : [...acc, name]), []);

const field = testName => `limits.${testName}`;
*/

/*
 * Special functions for cloning buttons
 */

// Encoding function which help us avoid problems with some characters in test names and env ids (e.g., character '.').
export const encodeTestName = testName => 'test' + btoa(testName);
export const encodeEnvironmentId = envId => 'env' + btoa(envId);

// Get a single value by its test name, environment ID, and field identifier
const getSimpleLimitsOf = (
  { form },
  formName,
  testName,
  runtimeEnvironmentId,
  field
) => {
  const testEnc = encodeTestName(testName);
  const envEnc = encodeEnvironmentId(runtimeEnvironmentId);
  return (
    form[formName].values.limits[testEnc][envEnc][field] ||
    form[formName].initial.limits[testName][envEnc][field] ||
    null
  );
};

// Lists all form keys to which the value should be copied
const getTargetFormKeys = (
  { form }, // form key in the store
  formName, // form identifier
  testName, // test name or null (if all test should be targetted)
  environmentId, // environment ID or null (if all environments should be targetted)
  field // field identifier (memory or wall-time)
) => {
  const testEnc = testName ? encodeTestName(testName) : null;
  const envEnc = environmentId ? encodeEnvironmentId(environmentId) : null;
  return form && form[formName] && form[formName].registeredFields
    ? Object.keys(form[formName].registeredFields).filter(key => {
        const [, test, env, f] = key.split('.');
        return (
          (!testEnc || test === testEnc) &&
          (!envEnc || env === envEnc) &&
          f === field
        );
      })
    : [];
};

// Clone given value vertically (all test in environment)
export const cloneVertically = (
  formName, // form identifier
  testName, // test identifier
  runtimeEnvironmentId, // environment identifier
  field // field identifier (memory or wall-time)
) => (dispatch, getState) => {
  const state = getState();
  const value = getSimpleLimitsOf(
    state,
    formName,
    testName,
    runtimeEnvironmentId,
    field
  );
  if (value !== null) {
    getTargetFormKeys(
      state,
      formName,
      null, // no test name => all test selected
      runtimeEnvironmentId,
      field
    ).map(key => dispatch(change(formName, key, value)));
  }
};

// Clone given value horizontally (all environments of the same test)
export const cloneHorizontally = (
  formName, // form identifier
  testName, // test identifier
  runtimeEnvironmentId, // environment identifier
  field // field identifier (memory or wall-time)
) => (dispatch, getState) => {
  const state = getState();
  const value = getSimpleLimitsOf(
    state,
    formName,
    testName,
    runtimeEnvironmentId,
    field
  );
  if (value !== null) {
    getTargetFormKeys(
      state,
      formName,
      testName,
      null, // no environemnt ID => all environments accepted
      field
    ).map(key => dispatch(change(formName, key, value)));
  }
};

// Clone given value to all fields
export const cloneAll = (
  formName, // form identifier
  testName, // test identifier
  runtimeEnvironmentId, // environment identifier
  field // field identifier (memory or wall-time)
) => (dispatch, getState) => {
  const state = getState();
  const value = getSimpleLimitsOf(
    state,
    formName,
    testName,
    runtimeEnvironmentId,
    field
  );
  if (value !== null) {
    getTargetFormKeys(
      state,
      formName,
      null, // no test name ...
      null, // ... nor environemnt ID => all fields
      field
    ).map(key => dispatch(change(formName, key, value)));
  }
};

const reducer = handleActions(reduceActions, initialState);
export default reducer;
