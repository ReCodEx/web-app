import { handleActions } from 'redux-actions';
import factory, { initialState, resourceStatus, createRecord } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { additionalActionTypes as assignmentsActionTypes } from './assignments';
import { arrayToObject } from '../../helpers/common';
import { Map } from 'immutable';

const resourceName = 'asyncJobs';
const {
  actions,
  actionTypes: resourceActionTypes,
  reduceActions,
} = factory({
  resourceName,
  apiEndpointFactory: id => `/async-jobs/${id}`,
});

export const actionTypes = {
  ASYNC_JOBS_ABORT: 'recodex/async-jobs/ABORT',
  ASYNC_JOBS_ABORT_PENDING: 'recodex/async-jobs/ABORT_PENDING',
  ASYNC_JOBS_ABORT_FULFILLED: 'recodex/async-jobs/ABORT_FULFILLED',
  ASYNC_JOBS_ABORT_REJECTED: 'recodex/async-jobs/ABORT_REJECTED',
  ASYNC_JOBS_PING: 'recodex/async-jobs/PING',
  ASYNC_JOBS_PING_PENDING: 'recodex/async-jobs/PING_PENDING',
  ASYNC_JOBS_PING_FULFILLED: 'recodex/async-jobs/PING_FULFILLED',
  ASYNC_JOBS_PING_REJECTED: 'recodex/async-jobs/PING_REJECTED',
};

/**
 * Actions
 */

export const fetchAsyncJob = actions.fetchResource;
export const fetchAsyncJobIfNeeded = actions.fetchOneIfNeeded;

export const fetchAllJobs = (includeScheduled = true, ageThreshold = 3600) => {
  const query = { includeScheduled: includeScheduled ? 1 : 0 };
  if (ageThreshold) {
    query.ageThreshold = ageThreshold;
  }

  return actions.fetchMany({
    endpoint: '/async-jobs',
    meta: { allowReload: true },
    query,
  });
};

export const abort = id =>
  createApiAction({
    type: actionTypes.ASYNC_JOBS_ABORT,
    method: 'POST',
    endpoint: `/async-jobs/${id}/abort`,
    meta: { id },
  });

export const ping = () =>
  createApiAction({
    type: actionTypes.ASYNC_JOBS_PING,
    method: 'POST',
    endpoint: '/async-jobs/ping',
  });

/**
 * Reducer takes mainly care about all the state of individual attachments
 */

const reducer = handleActions(
  Object.assign({}, reduceActions, {
    [actionTypes.ASYNC_JOBS_ABORT_PENDING]: (state, { meta: { id } }) =>
      state.hasIn(['resources', id])
        ? state.setIn(['resources', id, 'state'], resourceStatus.UPDATING)
        : state.setIn(['resources', id], createRecord({ state: resourceStatus.UPDATING })),

    [actionTypes.ASYNC_JOBS_ABORT_FULFILLED]: reduceActions[resourceActionTypes.FETCH_FULFILLED],

    [actionTypes.ASYNC_JOBS_ABORT_REJECTED]: (state, { meta: { id } }) =>
      state.hasIn(['resources', id])
        ? state.setIn(['resources', id, 'state'], resourceStatus.FAILED)
        : state.setIn(['resources', id], createRecord({ state: resourceStatus.FAILED })),

    [actionTypes.ASYNC_JOBS_PING_PENDING]: state => state.set('ping', resourceStatus.PENDING),

    [actionTypes.ASYNC_JOBS_PING_FULFILLED]: (state, { payload: data }) =>
      state.delete('ping').setIn(['resources', data.id], createRecord({ state: resourceStatus.FULFILLED, data })),

    [actionTypes.ASYNC_JOBS_PING_REJECTED]: state => state.set('ping', resourceStatus.REJECTED),

    [assignmentsActionTypes.RESUBMIT_ALL_FULFILLED]: (state, { payload: { pending, failed } }) =>
      state.update('resources', jobs =>
        jobs.merge(
          new Map(
            arrayToObject(
              [...pending, ...failed],
              o => o.id,
              data => createRecord({ state: resourceStatus.FULFILLED, data })
            )
          )
        )
      ),

    [assignmentsActionTypes.FETCH_ASYNC_JOBS_FULFILLED]: (state, { payload }) =>
      state.update('resources', jobs =>
        jobs.merge(
          new Map(
            arrayToObject(
              payload,
              o => o.id,
              data => createRecord({ state: resourceStatus.FULFILLED, data })
            )
          )
        )
      ),
  }),
  initialState
);

export default reducer;
