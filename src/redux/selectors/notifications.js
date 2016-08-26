import { createSelector } from 'reselect';

const getNotifications = state => state.notifications;

export const newNotificationsSelector = createSelector(getNotifications, notifications => notifications.get('visible'));
export const oldNotificationsSelector = createSelector(getNotifications, notifications => notifications.get('hidden'));
