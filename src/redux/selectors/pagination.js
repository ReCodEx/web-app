import { createSelector } from 'reselect';
import { EMPTY_ARRAY, simpleScalarMemoize } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';

const getPagination = componentId => state => state.pagination.get(componentId);
const getEndpointResources = endpoint => state =>
  state[endpoint].get('resources');

/**
 * Public selectors
 */

export const getPaginationOffset = simpleScalarMemoize(componentId =>
  createSelector(
    getPagination(componentId),
    pagination => pagination && pagination.get('offset')
  )
);

export const getPaginationLimit = simpleScalarMemoize(componentId =>
  createSelector(
    getPagination(componentId),
    pagination => pagination && pagination.get('limit')
  )
);

export const getPaginationTotalCount = simpleScalarMemoize(componentId =>
  createSelector(
    getPagination(componentId),
    pagination => pagination && pagination.get('totalCount')
  )
);

export const getPaginationOrderBy = simpleScalarMemoize(componentId =>
  createSelector(
    getPagination(componentId),
    pagination => pagination && pagination.get('orderBy')
  )
);

export const getPaginationFilters = simpleScalarMemoize(componentId =>
  createSelector(
    getPagination(componentId),
    pagination => pagination && pagination.get('filters').toJS()
  )
);

export const getPaginationIsPending = simpleScalarMemoize(componentId =>
  createSelector(getPagination(componentId), pagination =>
    Boolean(pagination && pagination.get('pending'))
  )
);

export const getPaginationDataJS = simpleScalarMemoize(
  (componentId, endpoint) =>
    createSelector(
      [getPagination(componentId), getEndpointResources(endpoint)],
      (pagination, resources) => {
        const totalCount = pagination && pagination.get('totalCount');
        if (!pagination || !resources || !totalCount) {
          return EMPTY_ARRAY;
        }

        // Get the right range of offsets
        let offset = pagination.get('offset');
        const offsetEnd = Math.min(
          offset + pagination.get('limit'),
          totalCount
        );

        // Collect entities by their IDs
        const res = [];
        while (offset < offsetEnd) {
          const id = pagination.getIn(['data', offset], null);
          const entity = id && resources.get(id);
          const entityData = isReady(entity) && entity.get('data');
          res.push(entityData ? entityData.toJS() : null);
          ++offset;
        }
        return res;
      }
    )
);
