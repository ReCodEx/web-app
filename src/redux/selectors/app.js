export const getApp = state => state.app;
export const getLang = state => (state.app && state.app.get('lang')) || 'en';
export const anyPendingFetchOperations = state => state.app && state.app.get('pendingFetchOperations') > 0;
