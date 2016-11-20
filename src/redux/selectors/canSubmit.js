import { createSelector } from 'reselect';

const getResources = state => state.canSubmit.get('resources');
export const canSubmitSolution = assignmentId =>
  createSelector(
    getResources,
    (resources) => resources.get(assignmentId) || null
  );
