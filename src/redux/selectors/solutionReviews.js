import { createSelector } from 'reselect';

const getSolutionsReviewsResources = state => state.solutionReviews.get('resources');
const getParam = (_, id) => id;

export const getSolutionReviewComments = createSelector(
  [getSolutionsReviewsResources, getParam],
  (reviewComments, id) => reviewComments.get(id)
);
