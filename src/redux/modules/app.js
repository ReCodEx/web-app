import { createAction, handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import { createApiAction } from '../middleware/apiMiddleware.js';
import { createActionsWithPostfixes } from '../helpers/resourceManager';

export const actionTypes = {
  SET_LANG: 'recodex/app/SET_LANG',
  NEW_PENDING_FETCH_OPERATION: 'recodex/app/NEW_PENDING_FETCH_OPERATION',
  COMPLETED_FETCH_OPERATION: 'recodex/app/COMPLETED_FETCH_OPERATION',
  ...createActionsWithPostfixes('EXTENSION_URL', 'recodex/app'),
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

export const fetchExtensionUrl = (extension, instance, locale, returnUrl = '') =>
  createApiAction({
    type: actionTypes.EXTENSION_URL,
    method: 'GET',
    endpoint: `/extensions/${encodeURIComponent(extension)}/${encodeURIComponent(instance)}?locale=${encodeURIComponent(locale)}&return=${encodeURIComponent(returnUrl)}`,
    meta: { extension, instance, locale },
  });

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
