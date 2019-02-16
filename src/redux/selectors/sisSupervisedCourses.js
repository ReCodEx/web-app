import { createSelector } from 'reselect';
import { Map } from 'immutable';
import { EMPTY_MAP } from '../../helpers/common';
import { loggedInUserIdSelector } from './auth';

const getResources = state => state.sisSupervisedCourses.get('resources');

const getSisStateTerms = state => state.sisStatus.getIn(['resources', 'status', 'data', 'terms']);

export const sisSupervisedCoursesSelector = createSelector(
  [getResources, getSisStateTerms, loggedInUserIdSelector],
  (resources, terms, userId) => {
    return resources && terms && terms.size > 0 && resources.get(userId)
      ? Map(
          terms.map(term => {
            const termKey = term.get('year') + '-' + term.get('term');
            return [termKey, resources.getIn([userId, termKey], EMPTY_MAP)];
          })
        )
      : EMPTY_MAP;
  }
);
