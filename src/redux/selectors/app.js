export const getApp = state => state.app;
export const anyPendingFetchOperations = state => getApp(state).get('pendingFetchOperations') > 0;
