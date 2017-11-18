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

const engine = filter(createEngine('recodex/store'), ['userSwitching']);

const getMiddleware = history => [
  authMiddleware,
  apiMiddleware,
  promiseMiddleware(),
  thunkMiddleware,
  routerMiddleware(history),
  storage.createMiddleware(
    engine,
    [],
    [
      authActionTypes.LOGIN_SUCCESS,
      authActionTypes.LOGOUT,
      switchingActionTypes.REMOVE_USER
    ]
  )
];

const dev = history =>
  compose(
    applyMiddleware(
      ...getMiddleware(history),
      loggerMiddleware(!canUseDOM || !window.devToolsExtension)
    ),
    canUseDOM && window.devToolsExtension ? window.devToolsExtension() : f => f // use the DEVtools if the extension is installed
  );

const prod = history => compose(applyMiddleware(...getMiddleware(history)));

const isDev = () => process.env.NODE_ENV === 'development';

export const configureStore = (history, initialState, token) => {
  const reducer = createReducer(token);
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
