import { createSelector } from 'reselect';
import { fetchManyEndpoint } from '../modules/systemMessages';
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
