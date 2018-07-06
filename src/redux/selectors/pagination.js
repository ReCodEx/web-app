import { createSelector, defaultMemoize } from 'reselect';
import { EMPTY_ARRAY } from '../../helpers/common';
import { isReady } from '../helpers/resourceManager';

const getPagination = entities => state => state.pagination.get(entities);
const getEntitiesResources = entities => state =>
  state[entities].get('resources');

/**
 * Public selectors
 */

export const getPaginationOffset = defaultMemoize(entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('offset')
  )
);

export const getPaginationLimit = defaultMemoize(entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('limit')
  )
);

export const getPaginationTotalCount = defaultMemoize(entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('totalCount')
  )
);

export const getPaginationOrderBy = defaultMemoize(entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('orderBy')
  )
);

export const getPaginationFilters = defaultMemoize(entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('filters').toJS()
  )
);

export const getPaginationIsPending = defaultMemoize(entities =>
  createSelector(getPagination(entities), pagination =>
    Boolean(pagination && pagination.get('pending'))
  )
);

export const getPaginationDataJS = defaultMemoize(entities =>
  createSelector(
    [getPagination(entities), getEntitiesResources(entities)],
    (pagination, resources) => {
      const totalCount = pagination.get('totalCount');
      if (!pagination || !resources || !totalCount) {
        return EMPTY_ARRAY;
      }

      // Get the right range of offsets
      let offset = pagination.get('offset');
      const offsetEnd = Math.min(offset + pagination.get('limit'), totalCount);

      // Collect entities by their IDs
      const res = [];
      while (offset < offsetEnd) {
        const id = pagination.getIn(['data', offset], null);
        const entity = id && resources.get(id);
        const entityData = isReady(entity) && entity.get('data');
        res.push(entityData && entityData.toJS());
        ++offset;
      }
      return res;
    }
  )
);
