import { createSelector } from 'reselect';
import { resourceStatus, getJsData } from '../helpers/resourceManager';
import { getSolutions } from './solutions';

const getSolutionsReviewsResources = state => state.solutionReviews.get('resources');
const getOpenReviews = state => state.solutionReviews.get('open-reviews');
const getParam = (_, id) => id;

export const getSolutionReviewComments = createSelector(
  [getSolutionsReviewsResources, getParam],
  (reviewComments, id) => reviewComments.get(id)
);

export const isSolutionReviewUpdatePending = createSelector(
  [getSolutionsReviewsResources, getParam],
  (reviewComments, id) => reviewComments.getIn([id, 'state']) === resourceStatus.RELOADING
);

export const isSolutionReviewUpdatePendingSelector = createSelector(
  [getSolutionsReviewsResources],
  reviewComments => id => reviewComments.getIn([id, 'state']) === resourceStatus.RELOADING
);

const solutionComparator = (a, b) =>
  ((a && a.review && a.review.startedAt) || 0) - ((b && b.review && b.review.startedAt) || 0);

export const getOpenReviewsSolutions = createSelector(
  [getOpenReviews, getSolutions, getParam],
  (openReviews, solutions, userId) => {
    const index = openReviews && openReviews.get(userId);
    if (!index || typeof index !== 'object') {
      return null;
    }

    const res = index.toJS();
    Object.values(res).forEach(groupIdx =>
      Object.keys(groupIdx).forEach(assignmentId => {
        groupIdx[assignmentId] = groupIdx[assignmentId]
          .map(solutionId => solutions.get(solutionId) && getJsData(solutions.get(solutionId)))
          .sort(solutionComparator);
      })
    );
    return res;
  }
);

export const getOpenReviewsSolutionsState = createSelector([getOpenReviews, getParam], (openReviews, userId) => {
  const index = openReviews && openReviews.get(userId);
  return index && typeof index === 'object' ? resourceStatus.FULFILLED : index || null;
});
