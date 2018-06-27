import { handleActions, createAction, Identity } from 'redux-actions';
import { Map, List, fromJS } from 'immutable';
import { createApiAction } from '../middleware/apiMiddleware';
import { didInvalidate } from '../helpers/resourceManager';

export const actionTypes = {
  SET_OFFSET: 'recodex/pagination/SET_OFFSET',
  SET_LIMIT: 'recodex/pagination/SET_LIMIT',
  SET_OFFSET_LIMIT: 'recodex/pagination/SET_OFFSET_LIMIT',
  SET_FILTERS: 'recodex/pagination/SET_FILTERS',
  SET_ORDERBY: 'recodex/pagination/SET_ORDERBY',
  FETCH_PAGINATED: 'recodex/pagination/FETCH_PAGINATED',
  FETCH_PAGINATED_PENDING: 'recodex/pagination/FETCH_PAGINATED_PENDING',
  FETCH_PAGINATED_FULFILLED: 'recodex/pagination/FETCH_PAGINATED_FULFILLED',
  FETCH_PAGINATED_REJECTED: 'recodex/pagination/FETCH_PAGINATED_REJECTED'
};

const paginationStructure = {
  data: [], // cache for entity IDs
  totalCount: null, // total number of entities for given combination of filters
  filters: {}, // current combination of applied filters
  orderBy: null, // ordering column
  pending: null, // null if no operation was started, Date.now() when pending operation was started, or false if operation has concluded
  lastUpdate: null, // last update (needed for automated invalidation)
  didInvalidate: false // just for the compatibility with regular resources
};
const createPaginationStructure = () => ({
  offset: 0, // currently selected offset
  limit: 50, // currently selected amount of data per page
  ...paginationStructure
});
const initialState = fromJS({
  exercises: createPaginationStructure(),
  pipelines: createPaginationStructure(),
  users: createPaginationStructure()
});

export const setPaginationOffset = entities =>
  createAction(actionTypes.SET_OFFSET, Identity, () => ({ entities }));

export const setPaginationLimit = entities =>
  createAction(actionTypes.SET_LIMIT, Identity, () => ({ entities }));

export const setPaginationOffsetLimit = entities =>
  createAction(
    actionTypes.SET_OFFSET_LIMIT,
    (offset, limit) => ({ offset, limit }),
    () => ({ entities })
  );

export const setPaginationFilters = entities =>
  createAction(actionTypes.SET_FILTERS, Identity, () => ({ entities }));

export const setPaginationOrderBy = entities =>
  createAction(actionTypes.SET_ORDERBY, Identity, () => ({ entities }));

export const fetchPaginated = entities => (offset, limit) =>
  createApiAction({
    type: actionTypes.FETCH_PAGINATED,
    endpoint: `/${entities}`,
    meta: { entities, offset, limit, started: Date.now() },
    query: { offset, limit } // TODO add filters and orderBy (selected instance ID must be transparently added to filter !!!)
    // TODO --- we need to be carefull, current middleware can encode only flat query objects (filters need to be encoded/flatten)
  });

/*
 * Reductors
 */

const preprocessItems = (items, offset) => {
  const res = [];
  items.forEach(item => {
    res[offset++] = item.id;
  });
  return res;
};

export default handleActions(
  {
    [actionTypes.SET_OFFSET]: (state, { payload, meta: { entities } }) =>
      state.setIn([entities, 'offset'], Number(payload)),

    [actionTypes.SET_LIMIT]: (state, { payload, meta: { entities } }) =>
      state.setIn([entities, 'limit'], Number(payload)),

    [actionTypes.SET_OFFSET_LIMIT]: (
      state,
      { payload: { offset, limit }, meta: { entities } }
    ) =>
      state
        .setIn([entities, 'offset'], Number(offset))
        .setIn([entities, 'limit'], Number(limit)),

    [actionTypes.SET_FILTERS]: (state, { payload, meta: { entities } }) =>
      state
        .mergeIn([entities], paginationStructure) // reset
        .setIn([entities, 'offset'], 0) // modification of filters require
        .setIn([entities, 'filters'], fromJS(payload)),

    [actionTypes.SET_ORDERBY]: (state, { payload, meta: { entities } }) =>
      state
        .mergeIn([entities], paginationStructure) // reset
        .setIn([entities, 'orderBy'], payload),

    [actionTypes.FETCH_PAGINATED_PENDING]: (
      state,
      { meta: { entities, started } }
    ) => state.setIn([entities, 'pending'], Number(started)),

    [actionTypes.FETCH_PAGINATED_FULFILLED]: (
      state,
      {
        payload: { items, totalCount, orderBy, filters, offset },
        meta: { entities, started }
      }
    ) => {
      if (state.getIn([entities, 'pending']) !== started) {
        return state;
      }

      // If important change occured or data are invalid, reset data cache ...
      totalCount = Number(totalCount);
      // TODO --- also test if filters or orderBy has changed ...
      if (
        state.getIn([entities, 'totalCount']) !== totalCount ||
        didInvalidate(state.get(entities))
      ) {
        state = state
          .setIn([entities, 'data'], List()) // remove cached indices (parameters have changed)
          .setIn([entities, 'lastUpdate'], Date.now())
          .setIn([entities, 'didInvalidate'], false);
      }

      // Make sure we have appropriate timestamp for cache expiration ...
      if (state.getIn([entities, 'lastUpdate']) === null) {
        state = state.setIn([entities, 'lastUpdate'], Date.now());
      }

      return state
        .mergeIn([entities], {
          totalCount,
          orderBy,
          filters,
          pending: false
        })
        .mergeIn([entities, 'data'], preprocessItems(items, offset));
    },

    [actionTypes.FETCH_PAGINATED_REJECTED]: (
      state,
      { meta: { entities, started } }
    ) =>
      state.getIn([entities, 'pending']) === started
        ? state.setIn([entities, 'pending'], false)
        : state
  },
  initialState
);
