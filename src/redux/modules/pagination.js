import { handleActions, createAction } from 'redux-actions';
import { Map, fromJS } from 'immutable';
import { createApiAction } from '../middleware/apiMiddleware';
import { didInvalidate } from '../helpers/resourceManager';
import {
  getPaginationOffset,
  getPaginationLimit,
  getPaginationOrderBy,
  getPaginationFilters,
} from '../selectors/pagination';
import { selectedInstanceId } from '../selectors/auth';

export const actionTypes = {
  REGISTER: 'recodex/pagination/REGISTER',
  SET_OFFSET: 'recodex/pagination/SET_OFFSET',
  SET_LIMIT: 'recodex/pagination/SET_LIMIT',
  SET_OFFSET_LIMIT: 'recodex/pagination/SET_OFFSET_LIMIT',
  SET_FILTERS: 'recodex/pagination/SET_FILTERS',
  SET_ORDERBY: 'recodex/pagination/SET_ORDERBY',
  FETCH_PAGINATED: 'recodex/pagination/FETCH_PAGINATED',
  FETCH_PAGINATED_PENDING: 'recodex/pagination/FETCH_PAGINATED_PENDING',
  FETCH_PAGINATED_FULFILLED: 'recodex/pagination/FETCH_PAGINATED_FULFILLED',
  FETCH_PAGINATED_REJECTED: 'recodex/pagination/FETCH_PAGINATED_REJECTED',
};

const paginationStructure = {
  data: {}, // cache for entity IDs
  totalCount: null, // total number of items available for given combination of filters
  orderBy: null, // ordering column
  filters: {}, // current combination of applied filters
  pending: null, // null if no operation was started, Date.now() when pending operation was started, or false if operation has concluded
  lastUpdate: null, // last update (needed for automated invalidation)
  didInvalidate: false, // just for the compatibility with regular resources
};
const createPaginationStructure = init =>
  fromJS({
    offset: 0, // currently selected offset
    limit: 0, // currently selected amount of data per page
    ...paginationStructure,
    ...init,
  });

const initialState = Map();

/*
 * Pagination structures are identified by componentId, which is unique string identifying paging component.
 */
export const registerPaginationComponent = createAction(actionTypes.REGISTER);

export const setPaginationOffset = componentId => createAction(actionTypes.SET_OFFSET, null, () => ({ componentId }));

export const setPaginationLimit = componentId => createAction(actionTypes.SET_LIMIT, null, () => ({ componentId }));

export const setPaginationOffsetLimit = componentId =>
  createAction(
    actionTypes.SET_OFFSET_LIMIT,
    (offset, limit) => ({ offset, limit }),
    () => ({ componentId })
  );

export const setPaginationOrderBy = componentId => createAction(actionTypes.SET_ORDERBY, null, () => ({ componentId }));

export const encodeOrderBy = (column, descending = false) => (descending ? `!${column}` : column);

export const decodeOrderBy = orderBy => {
  const descending = orderBy && orderBy.startsWith('!');
  const column = descending ? orderBy.substr(1) : orderBy;
  return { column, descending };
};

export const setPaginationFilters = componentId => createAction(actionTypes.SET_FILTERS, null, () => ({ componentId }));

export const fetchPaginated =
  (componentId, endpoint) =>
  (locale = null, offset = null, limit = null, forceInvalidate = false) =>
  (dispatch, getState) => {
    if (offset === null) {
      offset = getPaginationOffset(componentId)(getState());
    }
    if (limit === null) {
      limit = getPaginationLimit(componentId)(getState());
    }
    const orderBy = getPaginationOrderBy(componentId)(getState());
    const filters = getPaginationFilters(componentId)(getState());
    if (endpoint !== 'pipelines') {
      filters.instanceId = selectedInstanceId(getState());
    }

    const query = { offset, limit, filters };
    if (locale) {
      query.locale = locale;
    }
    if (orderBy) {
      query.orderBy = orderBy;
    }

    return dispatch(
      createApiAction({
        type: actionTypes.FETCH_PAGINATED,
        endpoint: `/${endpoint}`,
        meta: {
          componentId,
          endpoint,
          offset,
          limit,
          started: Date.now(),
          forceInvalidate,
        },
        query,
      })
    );
  };

/*
 * Reductors
 */

const addItemsWithMutations = (items, offset) => data =>
  data.withMutations(mutable => {
    items.forEach(item => {
      mutable.set(offset++, item.id);
    });
  });

export default handleActions(
  {
    [actionTypes.REGISTER]: (state, { payload: { id, ...init } }) =>
      state.get(id) ? state : state.set(id, createPaginationStructure(init)),

    [actionTypes.SET_OFFSET]: (state, { payload, meta: { componentId } }) =>
      state.setIn([componentId, 'offset'], Number(payload)),

    [actionTypes.SET_LIMIT]: (state, { payload, meta: { componentId } }) =>
      state.setIn([componentId, 'limit'], Number(payload)),

    [actionTypes.SET_OFFSET_LIMIT]: (state, { payload: { offset, limit }, meta: { componentId } }) =>
      state.setIn([componentId, 'offset'], Number(offset)).setIn([componentId, 'limit'], Number(limit)),

    [actionTypes.SET_FILTERS]: (state, { payload, meta: { componentId } }) =>
      state
        .setIn([componentId, 'didInvalidate'], true)
        .setIn([componentId, 'offset'], 0) // modification of filters require position reset
        .setIn([componentId, 'filters'], fromJS(payload)),

    [actionTypes.SET_ORDERBY]: (state, { payload, meta: { componentId } }) =>
      state.setIn([componentId, 'didInvalidate'], true).setIn([componentId, 'orderBy'], payload),

    [actionTypes.FETCH_PAGINATED_PENDING]: (state, { meta: { componentId, started } }) =>
      componentId ? state.setIn([componentId, 'pending'], Number(started)) : state,

    [actionTypes.FETCH_PAGINATED_FULFILLED]: (
      state,
      { payload: { items, totalCount, orderBy, filters, offset }, meta: { componentId, started, forceInvalidate } }
    ) => {
      if (!componentId || state.getIn([componentId, 'pending']) !== started) {
        return state;
      }

      // If important change occured or data are invalid, reset data cache ...
      const totalCountNum = Number(totalCount);
      if (
        forceInvalidate ||
        state.getIn([componentId, 'totalCount']) !== totalCountNum ||
        didInvalidate(state.get(componentId))
      ) {
        state = state
          .setIn([componentId, 'data'], Map()) // remove cached indices (parameters have changed)
          .setIn([componentId, 'lastUpdate'], Date.now())
          .setIn([componentId, 'didInvalidate'], false);
      }

      // Make sure we have appropriate timestamp for cache expiration ...
      if (state.getIn([componentId, 'lastUpdate']) === null) {
        state = state.setIn([componentId, 'lastUpdate'], Date.now());
      }

      return state
        .mergeIn(
          [componentId],
          fromJS({
            totalCount: totalCountNum,
            orderBy,
            filters: Array.isArray(filters) ? {} : filters,
            pending: false,
          })
        )
        .updateIn([componentId, 'data'], addItemsWithMutations(items, offset));
    },

    [actionTypes.FETCH_PAGINATED_REJECTED]: (state, { meta: { componentId, started } }) =>
      componentId && state.getIn([componentId, 'pending']) === started
        ? state.setIn([componentId, 'pending'], false)
        : state,
  },
  initialState
);
