import { canUseDOM } from 'exenv';

import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import * as storage from 'redux-storage';
import authMiddleware from './middleware/authMiddleware';
import apiMiddleware from './middleware/apiMiddleware';
import createReducer from './reducer';
import createEngine from 'redux-storage-engine-localstorage';
import { actionTypes } from './modules/auth';

const engine = createEngine('recodex/store');

const getMiddleware = history => [
  authMiddleware,
  apiMiddleware,
  promiseMiddleware(),
  thunkMiddleware,
  routerMiddleware(history),
  storage.createMiddleware(engine, [], [actionTypes.LOGIN_SUCCESS])
];

const dev = history =>
  compose(
    applyMiddleware(...getMiddleware(history)),
    canUseDOM && window.devToolsExtension ? window.devToolsExtension() : f => f // use the DEVtools if the extension is installed
  );

const prod = history => compose(applyMiddleware(...getMiddleware(history)));

const isDev = () => process.env.NODE_ENV === 'development';

export const configureStore = (history, initialState, token) => {
  const reducer = createReducer(token, (old, next) => ({
    ...old,
    userSwitching: next.userSwitching
  }));
  const store = createStore(
    storage.reducer(reducer),
    initialState,
    (isDev() ? dev : prod)(history)
  );

  if (canUseDOM) {
    const load = storage.createLoader(engine);
    load(store);
  }

  return store;
};
