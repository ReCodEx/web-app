import { createSelector } from 'reselect';
import { List } from 'immutable';

const getSearches = state => state.search;

/**
 * Public selectors
 */

export const getSearch = id =>
  createSelector(getSearches, searches => searches.get(id));

export const getSearchResults = id =>
  createSelector(
    getSearch(id),
    search => (search ? search.get('results') : List())
  );

export const getSearchStatus = id =>
  createSelector(
    getSearch(id),
    search => (search ? search.get('status') : null)
  );

export const getSearchQuery = id =>
  createSelector(getSearch(id), search => (search ? search.get('query') : ''));
