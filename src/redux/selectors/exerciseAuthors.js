import { createSelector, lruMemoize } from 'reselect';
import { EMPTY_LIST } from '../../helpers/common.js';
import { isReady, isLoading } from '../helpers/resourceManager';
import { usersSelector } from './users.js';

const exerciseAuthorsAllSelector = state => state.exerciseAuthors.get('all');
const exerciseAuthorsOfGroupSelector = groupId => state => state.exerciseAuthors.getIn(['groups', groupId]);

export const getAllExerciseAuthors = createSelector(
  [exerciseAuthorsAllSelector, usersSelector],
  (authors, users) =>
    (authors && isReady(authors) && users && authors.get('data').map(id => users.get(id))) || EMPTY_LIST
);

export const getAllExerciseAuthorsIsLoading = createSelector([exerciseAuthorsAllSelector], authors =>
  Boolean(authors && isLoading(authors))
);

export const getExerciseAuthorsOfGroup = lruMemoize(groupId =>
  createSelector(
    [exerciseAuthorsOfGroupSelector(groupId), usersSelector],
    (authors, users) =>
      (authors && isReady(authors) && users && authors.get('data').map(id => users.get(id))) || EMPTY_LIST
  )
);

export const getExerciseAuthorsOfGroupIsLoading = lruMemoize(groupId =>
  createSelector([exerciseAuthorsOfGroupSelector(groupId)], authors => Boolean(authors && isLoading(authors)))
);
