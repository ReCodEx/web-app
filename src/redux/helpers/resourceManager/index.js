import { createAction } from 'redux-actions';
import { createApiAction } from '../../middleware/apiMiddleware.js';

import actionTypesFactory, { createActionsWithPostfixes } from './actionTypesFactory.js';
import actionCreatorsFactory from './actionCreatorsFactory.js';
import reducerFactory, { initialState } from './reducerFactory.js';
import createRecord, { getData, getJsData, getId } from './recordFactory.js';

import {
  resourceStatus,
  isLoading,
  isReadyOrReloading,
  hasFailed,
  getError,
  getUniqueErrors,
  isDeleting,
  isDeleted,
  isPosting,
  didInvalidate,
  isTooOld,
  afterTenMinutesIsTooOld,
  isReady,
} from './status.js';

import { defaultApiEndpointFactory, defaultSelectorFactory, defaultNeedsRefetching } from './utils.js';

export {
  actionTypesFactory,
  actionCreatorsFactory,
  reducerFactory,
  initialState,
  resourceStatus,
  isLoading,
  isReadyOrReloading,
  hasFailed,
  getError,
  getUniqueErrors,
  isDeleting,
  isDeleted,
  isPosting,
  didInvalidate,
  isTooOld,
  afterTenMinutesIsTooOld,
  isReady,
  getData,
  getJsData,
  getId,
  defaultNeedsRefetching,
  createRecord,
  createActionsWithPostfixes,
};

/**
 * Creates a reducer and prepared action creators
 */
const createResourceManager = ({
  idFieldName = 'id',
  resourceName,
  selector = defaultSelectorFactory(resourceName),
  apiEndpointFactory = defaultApiEndpointFactory(resourceName),
  needsRefetching = defaultNeedsRefetching,
}) => {
  const actionTypes = actionTypesFactory(resourceName);
  return {
    actionTypes,
    actions: actionCreatorsFactory({
      actionTypes,
      selector,
      apiEndpointFactory,
      needsRefetching,
      createAction,
      createApiAction,
    }), // @todo rename to actionCreators
    reduceActions: reducerFactory(actionTypes, idFieldName),
  };
};

export default createResourceManager;
