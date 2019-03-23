import { createApiCallPromise, getHeaders, isTwoHundredCode, abortAllPendingRequests } from '../helpers/api/tools';
import { actionTypes as authActionTypes } from '../modules/auth';
import { safeGet } from '../../helpers/common';

export const CALL_API = 'recodex-api/CALL';
export const createApiAction = request => ({ type: CALL_API, request });

export const apiCall = (
  {
    type,
    endpoint,
    method = 'GET',
    query = {},
    headers = {},
    accessToken = undefined,
    body = undefined,
    meta = undefined,
    wasSuccessful = isTwoHundredCode,
    doNotProcess = false,
    uploadFiles = false,
  },
  dispatch = undefined,
  getState = undefined
) => ({
  type,
  payload: {
    promise: createApiCallPromise(
      {
        endpoint,
        query,
        method,
        headers: getHeaders(headers, accessToken, uploadFiles),
        body,
        wasSuccessful,
        doNotProcess,
        uploadFiles,
      },
      dispatch,
      getState
    ),
    data: body,
  },
  meta: { endpoint, ...meta },
});

const lastLocation = {
  pathname: null,
  search: null,
};

const middleware = ({ dispatch, getState }) => next => action => {
  switch (action && action.type) {
    case CALL_API:
      if (!action.request) {
        throw new Error('API middleware requires request data in the action');
      }

      action = apiCall(action.request, dispatch, getState);
      break;

    case authActionTypes.LOGOUT:
    case '@@router/LOCATION_CHANGE': {
      const pathname = safeGet(action, ['payload', 'pathname'], null);
      const search = safeGet(action, ['payload', 'search'], null);
      if (pathname !== lastLocation.pathname || search !== lastLocation.search) {
        lastLocation.pathname = pathname;
        lastLocation.search = search;
        abortAllPendingRequests();
      }
      break;
    }
  }

  return next(action);
};

export default middleware;
