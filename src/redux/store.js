import React from 'react';
import { canUseDOM } from 'exenv';

import { createStore, compose, applyMiddleware } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import accessTokenMiddleware from './middleware/accessTokenMiddleware';
import apiMiddleware from './middleware/apiMiddleware';
import createReducer from './reducer';

const getMiddleware = (history) => [
  accessTokenMiddleware,
  apiMiddleware,
  promiseMiddleware(),
  thunkMiddleware,
  routerMiddleware(history)
];

const dev = (history) =>
  compose(
    applyMiddleware(
      ...getMiddleware(history)
    ),
    canUseDOM && window.devToolsExtension ? window.devToolsExtension() : f => f // use the DEVtools if the extension is installed
  );

const prod = (history) =>
  compose(
    applyMiddleware(
      ...getMiddleware(history)
    )
  );

const isDev = () =>
  process.env.NODE_ENV === 'development';

export const configureStore = (history, initialState, token) =>
  createStore(
    createReducer(token),
    initialState,
    (isDev() ? dev : prod)(history)
  );
