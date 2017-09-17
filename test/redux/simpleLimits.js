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

const initialState = {
  form: {
    [formA]: {
      values: {
        limits: {
          [testA]: { memory: 1, 'wall-time': 2, parallel: 3 },
          [testB]: { memory: 4, 'wall-time': 5, parallel: 6 }
        }
      }
    },
    [formB]: {
      values: {
        limits: {
          [testA]: { memory: 7, 'wall-time': 8, parallel: 9 },
          [testB]: { memory: 10, 'wall-time': 11, parallel: 12 }
        }
      }
    }
  }
};

const getTestStore = () =>
  createStore(combineReducers({ form: reducer }), initialState);

describe('simpleLimits', () => {
  describe('reducer', () => {
    it('must copy values horizontally across the same test', () => {
      const { dispatch, getState } = getTestStore();

      setHorizontally(formA, exerciseId, runtimeEnvironmentId, testA)(
        dispatch,
        getState
      );

      expect(getState()).to.eql({
        form: {
          [formA]: initialState.form[formA],
          [formB]: {
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

    it('must copy values vertically across the runtime environment', () => {
      const { dispatch, getState } = getTestStore();

      setVertically(formA, exerciseId, runtimeEnvironmentId, testA)(
        dispatch,
        getState
      );

      expect(getState()).to.eql({
        form: {
          [formA]: {
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

    it('must copy values vertucally across the runtime environment', () => {
      const { dispatch, getState } = getTestStore();

      setAll(formA, exerciseId, runtimeEnvironmentId, testA)(
        dispatch,
        getState
      );

      expect(getState()).to.eql({
        form: {
          [formA]: {
            values: {
              limits: {
                [testA]: initialState.form[formA].values.limits[testA],
                [testB]: initialState.form[formA].values.limits[testA]
              }
            }
          },
          [formB]: {
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
