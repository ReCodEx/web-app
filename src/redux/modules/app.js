import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';

export const actionTypes = {
  SET_LANG: 'recovid/app/SET_LANG',
  NEW_PENDING_FETCH_OPERATION: 'recovid/app/NEW_PENDING_FETCH_OPERATION',
  COMPLETED_FETCH_OPERATION: 'recovid/app/COMPLETED_FETCH_OPERATION',
};

const createInitialState = lang =>
  fromJS({
    lang,
    pendingFetchOperations: 0,
  });

export const setLang = createAction(actionTypes.SET_LANG, lang => ({
  lang,
}));
export const newPendingFetchOperation = createAction(actionTypes.NEW_PENDING_FETCH_OPERATION);
export const completedFetchOperation = createAction(actionTypes.COMPLETED_FETCH_OPERATION);

const app = (lang = 'en') =>
  handleActions(
    {
      [actionTypes.SET_LANG]: (state, { payload: { lang } }) => state.set('lang', lang),

      [actionTypes.NEW_PENDING_FETCH_OPERATION]: state =>
        state.update('pendingFetchOperations', pendingFetchOperations => pendingFetchOperations + 1),

      [actionTypes.COMPLETED_FETCH_OPERATION]: state =>
        state.update('pendingFetchOperations', pendingFetchOperations => pendingFetchOperations - 1),
    },
    createInitialState(lang)
  );

export default app;
