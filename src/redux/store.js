import { configureStore } from '@reduxjs/toolkit';
import promiseMiddleware from 'redux-promise-middleware';
import * as storage from 'redux-storage';
import createEngine from 'redux-storage-engine-localstorage';
import filter from 'redux-storage-decorator-filter';

import authMiddleware from './middleware/authMiddleware.js';
import apiMiddleware from './middleware/apiMiddleware.js';
import loggerMiddleware from './middleware/loggerMiddleware.js';
import langMiddleware from './middleware/langMiddleware.js';
import createReducer from './reducer.js';
import { actionTypes as authActionTypes } from './modules/authTypes.js';
import { actionTypes as switchingActionTypes } from './modules/userSwitching.js';
import { getConfigVar } from '../helpers/config.js';
import { canUseDOM } from '../helpers/common.js';

const PERSISTENT_TOKENS_KEY_PREFIX = getConfigVar('PERSISTENT_TOKENS_KEY_PREFIX') || 'recodex';

const engine = filter(createEngine(`${PERSISTENT_TOKENS_KEY_PREFIX}/store`), ['userSwitching']);

const isDev = () => process.env.NODE_ENV === 'development';

export const configureOurStore = (preloadedState, token, instanceId, lang) => {
  const reducer = storage.reducer(createReducer(token, instanceId, lang));
  const store = configureStore({
    reducer,
    preloadedState,
    devTools: isDev(),
    middleware: getDefaultMiddleware => {
      const defaultMiddleware = getDefaultMiddleware({ serializableCheck: false, immutableCheck: false });
      const middleware = [
        langMiddleware,
        authMiddleware,
        apiMiddleware,
        promiseMiddleware,
        ...defaultMiddleware,
        storage.createMiddleware(
          engine,
          [],
          [authActionTypes.LOGIN_FULFILLED, authActionTypes.LOGOUT, switchingActionTypes.REMOVE_USER]
        ),
      ];
      if (isDev()) {
        middleware.push(
          loggerMiddleware(
            !canUseDOM,
            process.env.LOGGER_MIDDLEWARE_VERBOSE === 'true',
            process.env.LOGGER_MIDDLEWARE_EXCEPTIONS === 'true'
          )
        );
      }
      return middleware;
    },
  });

  if (canUseDOM) {
    const load = storage.createLoader(engine);
    load(store);
  }

  return store;
};
