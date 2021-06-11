/**
 * Status of a resource record - helper functions
 * @module status
 */

export const resourceStatus = {
  PENDING: 'PENDING',
  RELOADING: 'RELOADING', // similar to pending, but the old record data are still available whilst being re-fetched
  UPDATING: 'UPDATING', // similar to reloading, but some modification is in progress
  FAILED: 'FAILED',
  FULFILLED: 'FULFILLED',
  POSTING: 'POSTING',
  DELETING: 'DELETING',
  DELETED: 'DELETED',
};

export const isLoadingState = state =>
  state === resourceStatus.PENDING || state === resourceStatus.RELOADING || state === resourceStatus.UPDATING;

/**
 * @param {Object} item The item
 * @return {boolean} True when the item is loading or reloaing.
 */
export const isLoading = item => !item || isLoadingState(item.get('state'));

/**
 * @param {Object} item The item
 * @return {boolean} True when the item is reloading (i.e., loading, but old record still exists).
 */
export const isReloading = item => Boolean(item) && item.get('state') === resourceStatus.RELOADING;

/**
 * @param {Object} item The item
 * @return {boolean} True when the item is updating (and reloading)
 */
export const isUpdating = item => Boolean(item) && item.get('state') === resourceStatus.UPDATING;

/**
 * @param {Object} item The item
 * @return {boolean} True when the item is being posted.
 */
export const isPosting = item => !item || item.get('state') === resourceStatus.POSTING;

/**
 * @param {Object} item The item
 * @return {boolean} True when the item is being deleted.
 */
export const isDeleting = item => !item || item.get('state') === resourceStatus.DELETING;

/**
 * @param {Object} item The item
 * @return {boolean} True when the item is being deleted.
 */
export const isDeleted = item => !item || item.get('state') === resourceStatus.DELETED;

/**
 * @param {Object} item The item
 * @return {boolean} True when the item could not be loaded, written, updated or deleted.
 */
export const hasFailed = item => Boolean(item) && item.get('state') === resourceStatus.FAILED;

/**
 * @param {Object} item The item
 * @return {boolean} True when the item has been loaded.
 */
export const isReady = item =>
  Boolean(item) && item.get('state') === resourceStatus.FULFILLED && Boolean(item.get('data'));

/**
 * @param {Object} item The item
 * @return {boolean} True when the item has been loaded or is currently reloading (but data are available).
 */
export const isReadyOrReloading = item =>
  Boolean(item) &&
  Boolean(item.get('data')) &&
  (item.get('state') === resourceStatus.FULFILLED || item.get('state') === resourceStatus.RELOADING);

/**
 * @param {number} Number of milliseconds since Jan 1 1970
 * @return {Function} The function returns true when the item is too old and should be invalidated.
 */
export const isTooOld = threshold => item => Date.now() - item.get('lastUpdate') > threshold;

/**
 * Instance of the 'isTooOld'
 */
export const afterTenMinutesIsTooOld = isTooOld(10 * 60 * 1000);

/**
 * @param {Object} item The item
 * @return {boolean} True when the item is outdated.
 */
export const didInvalidate = (item, isTooOld = afterTenMinutesIsTooOld) =>
  item.get('didInvalidate') === true || isTooOld(item);
