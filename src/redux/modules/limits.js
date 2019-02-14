import { handleActions } from 'redux-actions';
import { change } from 'redux-form';

import { encodeId, encodeNumId } from '../../helpers/common';
import factory, { initialState } from '../helpers/resourceManager';

/**
 * Create actions & reducer
 */

const resourceName = 'exerciseEnvironmentLimits';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/exercises/${id}/limits`,
});

export const additionalActionTypes = {
  CLONE_VERTICAL: 'recodex/limits/CLONE_VERTICAL',
  CLONE_HORIZONTAL: 'recodex/limits/CLONE_HORIZONTAL',
  CLONE_ALL: 'recodex/limits/CLONE_ALL',
};

export const fetchExerciseLimits = actions.fetchResource;
export const fetchExerciseLimitsIfNeeded = actions.fetchOneIfNeeded;
export const setExerciseLimits = actions.updateResource;

/*
 * Special functions for cloning buttons
 */

// Get a single value by its test name, environment ID, and field identifier
const getFormLimitsOf = (
  { form },
  formName,
  testId,
  runtimeEnvironmentId,
  field
) => {
  const testEnc = encodeNumId(testId);
  const envEnc = encodeId(runtimeEnvironmentId);
  return (
    form[formName].values.limits[testEnc][envEnc][field] ||
    form[formName].initial.limits[testId][envEnc][field] ||
    null
  );
};

// Lists all form keys to which the value should be copied
const getTargetFormKeys = (
  { form }, // form key in the store
  formName, // form identifier
  testId, // test id or null (if all test should be targetted)
  environmentId, // environment ID or null (if all environments should be targetted)
  field // field identifier (memory or time)
) => {
  const testEnc = testId ? encodeNumId(testId) : null;
  const envEnc = environmentId ? encodeId(environmentId) : null;
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
  testId, // test identifier
  runtimeEnvironmentId, // environment identifier
  field // field identifier (memory or time)
) => (dispatch, getState) => {
  const state = getState();
  const value = getFormLimitsOf(
    state,
    formName,
    testId,
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
  testId, // test identifier
  runtimeEnvironmentId, // environment identifier
  field // field identifier (memory or time)
) => (dispatch, getState) => {
  const state = getState();
  const value = getFormLimitsOf(
    state,
    formName,
    testId,
    runtimeEnvironmentId,
    field
  );
  if (value !== null) {
    getTargetFormKeys(
      state,
      formName,
      testId,
      null, // no environment ID => all environments accepted
      field
    ).map(key => dispatch(change(formName, key, value)));
  }
};

// Clone given value to all fields
export const cloneAll = (
  formName, // form identifier
  testId, // test identifier
  runtimeEnvironmentId, // environment identifier
  field // field identifier (memory or time)
) => (dispatch, getState) => {
  const state = getState();
  const value = getFormLimitsOf(
    state,
    formName,
    testId,
    runtimeEnvironmentId,
    field
  );
  if (value !== null) {
    getTargetFormKeys(
      state,
      formName,
      null, // no test name ...
      null, // ... nor environment ID => all fields
      field
    ).map(key => dispatch(change(formName, key, value)));
  }
};

const reducer = handleActions(reduceActions, initialState);
export default reducer;
