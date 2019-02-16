import { createApiCallPromise, getHeaders, isTwoHundredCode, abortAllPendingRequests } from '../helpers/api/tools';
import { actionTypes as authActionTypes } from '../modules/auth';

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
  dispatch = undefined
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
      dispatch
    ),
    data: body,
  },
  meta: { endpoint, ...meta },
});

const middleware = ({ dispatch }) => next => action => {
  switch (action && action.type) {
    case CALL_API:
      if (!action.request) {
        throw new Error('API middleware requires request data in the action');
      }

      action = apiCall(action.request, dispatch);
      break;

    case authActionTypes.LOGOUT:
    case '@@router/LOCATION_CHANGE':
      abortAllPendingRequests();
      break;
  }

  return next(action);
};

export default middleware;
