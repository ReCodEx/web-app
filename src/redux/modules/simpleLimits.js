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

const getSimpleLimitsOf = (
  { form },
  formName,
  exerciseId,
  runtimeEnvironmentId,
  testName
) =>
  form[formName].values.limits[testName] ||
  form[formName].values.initial[testName] ||
  {};

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

export const setVertically = (
  formName,
  exerciseId,
  runtimeEnvironmentId,
  testName
) => (dispatch, getState) => {
  const state = getState();
  const data = getSimpleLimitsOf(
    state,
    formName,
    exerciseId,
    runtimeEnvironmentId,
    testName
  );
  getAllTestNames(getState(), formName).map(testName =>
    dispatch(change(formName, field(testName), data))
  );
};

export const setHorizontally = (
  formName,
  exerciseId,
  runtimeEnvironmentId,
  testName
) => (dispatch, getState) => {
  const state = getState();
  const data = getSimpleLimitsOf(
    state,
    formName,
    exerciseId,
    runtimeEnvironmentId,
    testName
  );
  getAllSimpleLimitsFormNames(getState(), testName).map(formName =>
    dispatch(change(formName, field(testName), data))
  );
};

export const setAll = (
  formName,
  exerciseId,
  runtimeEnvironmentId,
  testName
) => (dispatch, getState) => {
  const state = getState();
  const data = getSimpleLimitsOf(
    state,
    formName,
    exerciseId,
    runtimeEnvironmentId,
    testName
  );
  getAllSimpleLimitsFormNames(getState(), testName).map(formName =>
    getAllTestNames(getState(), formName).map(testName =>
      dispatch(change(formName, field(testName), data))
    )
  );
};

const reducer = handleActions(reduceActions, initialState);
export default reducer;
