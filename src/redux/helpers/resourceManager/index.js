import { createAction } from 'redux-actions';
import { createApiAction } from '../../middleware/apiMiddleware';

import actionTypesFactory from './actionTypesFactory';
import actionCreatorsFactory from './actionCreatorsFactory';
import reducerFactory, { initialState } from './reducerFactory';
import createRecord, { getData, getJsData, getId } from './recordFactory';

import {
  resourceStatus,
  isLoading,
  hasFailed,
  isDeleting,
  isDeleted,
  didInvalidate,
  isTooOld,
  afterTenMinutesIsTooOld,
  isReady
} from './status';

import {
  defaultApiEndpointFactory,
  defaultSelectorFactory,
  defaultNeedsRefetching
} from './utils';

export {
  actionTypesFactory,
  actionCreatorsFactory,
  reducerFactory,
  initialState,
  resourceStatus,
  isLoading,
  hasFailed,
  isDeleting,
  isDeleted,
  didInvalidate,
  isTooOld,
  afterTenMinutesIsTooOld,
  isReady,
  getData,
  getJsData,
  getId,
  defaultNeedsRefetching,
  createRecord
};

/**
 * Creates a reducer and prepared action creators
 */
const createResourceManager = ({
  resourceName,
  selector = defaultSelectorFactory(resourceName),
  apiEndpointFactory = defaultApiEndpointFactory(resourceName),
  needsRefetching = defaultNeedsRefetching
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
      createApiAction
    }), // @todo rename to actionCreators
    reduceActions: reducerFactory(actionTypes)
  };
};

export default createResourceManager;
