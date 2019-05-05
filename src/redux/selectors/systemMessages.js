import { createSelector } from 'reselect';
import { fetchManyEndpoint, fetchManyUserEndpoint } from '../modules/systemMessages';
import { isReady, getJsData } from '../helpers/resourceManager';

const getSystemMessages = state => state.systemMessages;
const getResources = messages => messages.get('resources');

export const systemMessagesSelector = createSelector(
  getSystemMessages,
  getResources
);

export const fetchManyStatus = createSelector(
  getSystemMessages,
  state => state.getIn(['fetchManyStatus', fetchManyEndpoint])
);

export const fetchManyUserStatus = createSelector(
  getSystemMessages,
  state => state.getIn(['fetchManyStatus', fetchManyUserEndpoint])
);

export const getMessage = messageId =>
  createSelector(
    systemMessagesSelector,
    messages => messages.get(messageId)
  );

export const readySystemMessagesSelector = createSelector(
  systemMessagesSelector,
  messages =>
    messages
      .toList()
      .filter(isReady)
      .map(getJsData)
      .toArray()
);

export const readyActiveSystemMessagesSelector = createSelector(
  readySystemMessagesSelector,
  messages =>
    messages
      .filter(m => m.visibleFrom * 1000 <= Date.now() && m.visibleTo * 1000 >= Date.now())
      .sort((a, b) => a.visibleTo - b.visibleTo) // show messages with shortest expiration first
);
