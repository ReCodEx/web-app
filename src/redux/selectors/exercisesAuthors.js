import { createSelector, lruMemoize } from 'reselect';
import { EMPTY_LIST } from '../../helpers/common.js';
import { isReady, isLoading } from '../helpers/resourceManager';
import { usersSelector } from './users.js';

const exericsesAuthorsAllSelector = state => state.exercisesAuthors.get('all');
const exericsesAuthorsOfGroupSelector = groupId => state => state.exercisesAuthors.getIn(['groups', groupId]);

export const getAllExercisesAuthors = createSelector(
  [exericsesAuthorsAllSelector, usersSelector],
  (authors, users) =>
    (authors && isReady(authors) && users && authors.get('data').map(id => users.get(id))) || EMPTY_LIST
);

export const getAllExercisesAuthorsIsLoading = createSelector([exericsesAuthorsAllSelector], authors =>
  Boolean(authors && isLoading(authors))
);

export const getExercisesAuthorsOfGroup = lruMemoize(groupId =>
  createSelector(
    [exericsesAuthorsOfGroupSelector(groupId), usersSelector],
    (authors, users) =>
      (authors && isReady(authors) && users && authors.get('data').map(id => users.get(id))) || EMPTY_LIST
  )
);

export const getExercisesAuthorsOfGroupIsLoading = lruMemoize(groupId =>
  createSelector([exericsesAuthorsOfGroupSelector(groupId)], authors => Boolean(authors && isLoading(authors)))
);
