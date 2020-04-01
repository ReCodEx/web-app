import { canUseDOM } from 'exenv';
import { createStore, compose, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import filter from 'redux-storage-decorator-filter';

import authMiddleware from './middleware/authMiddleware';
import apiMiddleware from './middleware/apiMiddleware';
import loggerMiddleware from './middleware/loggerMiddleware';
import langMiddleware from './middleware/langMiddleware';
import createReducer from './reducer';
import { actionTypes as authActionTypes } from './modules/authTypes';
import { actionTypes as switchingActionTypes } from './modules/userSwitching';
import { getConfigVar } from '../helpers/config';

const PERSISTENT_TOKENS_KEY_PREFIX = getConfigVar('PERSISTENT_TOKENS_KEY_PREFIX') || 'recovid';

const engine = filter(createEngine(`${PERSISTENT_TOKENS_KEY_PREFIX}/store`), ['userSwitching']);

const middleware = [
  langMiddleware,
  authMiddleware,
  apiMiddleware,
  promiseMiddleware,
  thunkMiddleware,
  storage.createMiddleware(
    engine,
    [],
    [authActionTypes.LOGIN_FULFILLED, authActionTypes.LOGOUT, switchingActionTypes.REMOVE_USER]
  ),
];

const composeEnhancers = (canUseDOM && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

const dev = () =>
  composeEnhancers(
    applyMiddleware(
      ...middleware,
      loggerMiddleware(
        !canUseDOM,
        process.env.LOGGER_MIDDLEWARE_VERBOSE === 'true',
        process.env.LOGGER_MIDDLEWARE_EXCEPTIONS === 'true'
      )
    )
  );

const prod = () => compose(applyMiddleware(...middleware));

const isDev = () => process.env.NODE_ENV === 'development';

export const configureStore = (initialState, token, instanceId, lang) => {
  const reducer = createReducer(token, instanceId, lang);
  const store = createStore(storage.reducer(reducer), initialState, (isDev() ? dev : prod)());

  if (canUseDOM) {
    const load = storage.createLoader(engine);
    load(store);
  }

  return store;
};
