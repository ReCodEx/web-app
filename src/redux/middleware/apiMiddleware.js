import { createApiCallPromise, getHeaders, isTwoHundredCode } from '../helpers/api/tools.js';

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

const middleware =
  ({ dispatch, getState }) =>
  next =>
  action => {
    // skip anything but API calls
    if (action?.type !== CALL_API) {
      return next(action);
    }

    if (!action.request) {
      throw new Error('API middleware requires request data in the action');
    }

    action = apiCall(action.request, dispatch, getState);
    return next(action);
  };

export default middleware;
