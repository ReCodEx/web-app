import { createSelector } from 'reselect';
import { EMPTY_ARRAY } from '../../helpers/common';

const getPagination = entities => state => state.pagination.get(entities);
const getEntitiesResources = entities => state =>
  state[entities].get('resources');

/**
 * Public selectors
 */

export const getPaginationOffset = entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('offset')
  );

export const getPaginationLimit = entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('limit')
  );

export const getPaginationTotalCount = entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('totalCount')
  );

export const getPaginationOrderBy = entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('orderBy')
  );

export const getPaginationFilters = entities =>
  createSelector(
    getPagination(entities),
    pagination => pagination && pagination.get('filters').toJS()
  );

export const getPaginationIsPending = entities =>
  createSelector(getPagination(entities), pagination =>
    Boolean(pagination && pagination.get('pending'))
  );

export const getPaginationDataJS = entities =>
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
        const entity = id && resources.getIn([id, 'data'], null);
        res.push(entity && entity.toJS());
        ++offset;
      }
      return res;
    }
  );
