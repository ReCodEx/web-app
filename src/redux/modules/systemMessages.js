import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'systemMessages';
var { actions, reduceActions } = factory({ resourceName, apiEndpointFactory: id => `/notifications/${id}` });

/**
 * Actions
 */
export const createMessage = actions.addResource;
export const editMessage = actions.updateResource;
export const deleteMessage = actions.removeResource;

export const fetchManyEndpoint = '/notifications/all';
export const fetchAllMessages = actions.fetchMany({
  endpoint: fetchManyEndpoint,
  meta: { allowReload: true },
});

export const fetchManyUserEndpoint = '/notifications';
export const fetchAllUserMessages = actions.fetchMany({
  endpoint: fetchManyUserEndpoint,
  meta: { allowReload: true },
});

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions(Object.assign({}, reduceActions, {}), initialState);

export default reducer;
