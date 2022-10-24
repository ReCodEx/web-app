import { createSelector } from 'reselect';
import { resourceStatus } from '../helpers/resourceManager';

const getSolutionsReviewsResources = state => state.solutionReviews.get('resources');
const getParam = (_, id) => id;

export const getSolutionReviewComments = createSelector(
  [getSolutionsReviewsResources, getParam],
  (reviewComments, id) => reviewComments.get(id)
);

export const isSolutionReviewUpdatePending = createSelector(
  [getSolutionsReviewsResources, getParam],
  (reviewComments, id) => reviewComments.getIn([id, 'state']) === resourceStatus.RELOADING
);
