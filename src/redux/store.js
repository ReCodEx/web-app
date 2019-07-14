import { canUseDOM } from 'exenv';

import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import * as storage from 'redux-storage';
import authMiddleware from './middleware/authMiddleware';
import apiMiddleware from './middleware/apiMiddleware';
import loggerMiddleware from './middleware/loggerMiddleware';
import createReducer from './reducer';
import createEngine from 'redux-storage-engine-localstorage';
import filter from 'redux-storage-decorator-filter';
import { actionTypes as authActionTypes } from './modules/auth';
import { actionTypes as switchingActionTypes } from './modules/userSwitching';
import { getConfigVar } from './helpers/api/tools';

const PERSISTENT_TOKENS_KEY_PREFIX = getConfigVar('PERSISTENT_TOKENS_KEY_PREFIX') || 'recodex';

const engine = filter(createEngine(`${PERSISTENT_TOKENS_KEY_PREFIX}/store`), ['userSwitching']);

const getMiddleware = history => [
  authMiddleware,
  apiMiddleware,
  promiseMiddleware,
  thunkMiddleware,
  routerMiddleware(history),
  storage.createMiddleware(
    engine,
    [],
    [authActionTypes.LOGIN_FULFILLED, authActionTypes.LOGOUT, switchingActionTypes.REMOVE_USER]
  ),
];

const composeEnhancers = (canUseDOM && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const dev = history =>
  composeEnhancers(
    applyMiddleware(
      ...getMiddleware(history),
      loggerMiddleware(
        !canUseDOM,
        process.env.LOGGER_MIDDLEWARE_VERBOSE === 'true',
        process.env.LOGGER_MIDDLEWARE_EXCEPTIONS === 'true'
      )
    )
  );

const prod = history => compose(applyMiddleware(...getMiddleware(history)));

const isDev = () => process.env.NODE_ENV === 'development';

export const configureStore = (history, initialState, token, instanceId) => {
  const reducer = createReducer(token, instanceId);
  const store = createStore(storage.reducer(reducer), initialState, (isDev() ? dev : prod)(history));

  if (canUseDOM) {
    const load = storage.createLoader(engine);
    load(store);
  }

  return store;
};
