import React from 'react';

import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { routerReducer, routerMiddleware } from 'react-router-redux';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducer';

const dev = (history) =>
  compose(
    applyMiddleware(
      thunkMiddleware,
      routerMiddleware(history)
    ),
    window.devToolsExtension()
  );

const prod = (history) =>
  compose(
    applyMiddleware(
      thunkMiddleware,
      routerMiddleware(history)
    )
  );

export function configureStore(history, initialState) {
  const isDev = process.env.NODE_ENV === 'development' && typeof window !== 'undefined';
  const store = createStore(
    reducer,
    initialState,
    isDev ? dev(history) : prod(history)
  );

  return store;
}
