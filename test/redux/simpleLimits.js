import { expect } from 'chai';
import { createStore, combineReducers } from 'redux';
import { reducer } from 'redux-form';
import {
  setHorizontally,
  setVertically,
  setAll
} from '../../src/redux/modules/simpleLimits';

const random = () => Math.random().toString().substring(2);

const formA = random();
const formB = random();
const exerciseId = random();
const runtimeEnvironmentId = random();
const testA = random();
const testB = random();
const registeredFields = {
  [`limits.${testA}.memory`]: {
    name: `limits.${testA}.memory`,
    type: 'Field',
    count: 1
  },
  [`limits.${testA}.wall-time`]: {
    name: `limits.${testA}.wall-time`,
    type: 'Field',
    count: 1
  },
  [`limits.${testB}.memory`]: {
    name: `limits.${testB}.memory`,
    type: 'Field',
    count: 1
  },
  [`limits.${testB}.wall-time`]: {
    name: `limits.${testB}.wall-time`,
    type: 'Field',
    count: 1
  }
};

const initialState = {
  form: {
    [formA]: {
      registeredFields,
      values: {
        limits: {
          [testA]: { memory: 1, 'wall-time': 2 },
          [testB]: { memory: 4, 'wall-time': 5 }
        }
      }
    },
    [formB]: {
      registeredFields,
      values: {
        limits: {
          [testA]: { memory: 7, 'wall-time': 8 },
          [testB]: { memory: 10, 'wall-time': 11 }
        }
      }
    }
  }
};

const getTestStore = () =>
  createStore(combineReducers({ form: reducer }), initialState);

describe('simpleLimits', () => {
  describe('reducer', () => {
    it('must copy values horizontally across the same tests', () => {
      const { dispatch, getState } = getTestStore();

      setHorizontally(formA, exerciseId, runtimeEnvironmentId, testA)(
        dispatch,
        getState
      );

      expect(getState()).to.eql({
        form: {
          [formA]: initialState.form[formA],
          [formB]: {
            registeredFields,
            values: {
              limits: {
                [testA]: initialState.form[formA].values.limits[testA],
                [testB]: initialState.form[formB].values.limits[testB]
              }
            }
          }
        }
      });
    });

    it('must copy values vertically across the runtime environments', () => {
      const { dispatch, getState } = getTestStore();

      setVertically(formA, exerciseId, runtimeEnvironmentId, testA)(
        dispatch,
        getState
      );

      expect(getState()).to.eql({
        form: {
          [formA]: {
            registeredFields,
            values: {
              limits: {
                [testA]: initialState.form[formA].values.limits[testA],
                [testB]: initialState.form[formA].values.limits[testA]
              }
            }
          },
          [formB]: initialState.form[formB]
        }
      });
    });

    it('must copy values in all directions across the runtime environments', () => {
      const { dispatch, getState } = getTestStore();

      setAll(formA, exerciseId, runtimeEnvironmentId, testA)(
        dispatch,
        getState
      );

      expect(getState()).to.eql({
        form: {
          [formA]: {
            registeredFields,
            values: {
              limits: {
                [testA]: initialState.form[formA].values.limits[testA],
                [testB]: initialState.form[formA].values.limits[testA]
              }
            }
          },
          [formB]: {
            registeredFields,
            values: {
              limits: {
                [testA]: initialState.form[formA].values.limits[testA],
                [testB]: initialState.form[formA].values.limits[testA]
              }
            }
          }
        }
      });
    });
  });
});
