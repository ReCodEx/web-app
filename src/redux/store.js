import { canUseDOM } from 'exenv';

import { createStore, compose, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'remote-redux-devtools';
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

const REDUX_DEV_SERVER_PORT =
  process.env.REDUX_DEV_SERVER_PORT !== 'undefined'
    ? process.env.REDUX_DEV_SERVER_PORT
    : null;

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

const composeEnhancers = REDUX_DEV_SERVER_PORT
  ? composeWithDevTools({
      realtime: true,
      name: 'ReCodEx',
      host: '127.0.0.1',
      port: REDUX_DEV_SERVER_PORT
    })
  : f => f;

const dev = history =>
  composeEnhancers(
    compose(
      applyMiddleware(
        ...getMiddleware(history),
        loggerMiddleware(
          !canUseDOM,
          process.env.LOGGER_MIDDLEWARE_VERBOSE === 'true',
          process.env.LOGGER_MIDDLEWARE_EXCEPTIONS === 'true'
        )
      ),
      !REDUX_DEV_SERVER_PORT && canUseDOM && window.devToolsExtension // if no server is in place and dev tools are available, use them
        ? window.devToolsExtension()
        : f => f
    )
  );

const prod = history => compose(applyMiddleware(...getMiddleware(history)));

const isDev = () => process.env.NODE_ENV === 'development';

export const configureStore = (history, initialState, token, instanceId) => {
  const reducer = createReducer(token, instanceId);
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
