import React from 'react';

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import promiseMiddleware from 'redux-promise-middleware';
import accessTokenMiddleware from './middleware/accessTokenMiddleware';
import apiMiddleware from './middleware/apiMiddleware';
import createReducer from './reducer';

const getMiddleware = (history) => [
  thunkMiddleware,
  accessTokenMiddleware,
  apiMiddleware,
  promiseMiddleware(),
  routerMiddleware(history)
];

const dev = (history) =>
  compose(
    applyMiddleware(
      ...getMiddleware(history)
    ),
    window.devToolsExtension ? window.devToolsExtension() : undefined // use the DEVtools if the extension is installed
  );

const prod = (history) =>
  compose(
    applyMiddleware(
      ...getMiddleware(history)
    )
  );

const isDev = () =>
  process.env.NODE_ENV === 'development' && typeof window !== 'undefined';

export const configureStore = (history, initialState, token) =>
  createStore(
    createReducer(token),
    initialState,
    (isDev() ? dev : prod)(history)
  );
