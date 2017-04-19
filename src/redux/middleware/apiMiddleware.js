import {
  createApiCallPromise,
  getHeaders,
  isTwoHundredCode
} from '../helpers/api/tools';

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
    doNotProcess = false
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
        headers: getHeaders(headers, accessToken),
        body,
        wasSuccessful,
        doNotProcess
      },
      dispatch
    ),
    data: body
  },
  meta: { endpoint, ...meta }
});

const middleware = ({ dispatch }) =>
  next =>
    action => {
      switch (action.type) {
        case CALL_API:
          if (!action.request) {
            throw new Error(
              'API middleware requires request data in the action'
            );
          }

          action = apiCall(action.request, dispatch);
          break;
      }

      return next(action);
    };

export default middleware;
