import { createSelector } from 'reselect';

const getPlagiarisms = state => state.plagiarisms;
const getPlagiarismsResources = state => getPlagiarisms(state).get('resources');
const getParams = (_, batchId, solutionId) => `${batchId}/${solutionId}`;

export const plagiarismsSelector = createSelector([getPlagiarismsResources, getParams], (plagiarisms, id) =>
  plagiarisms.get(id)
);
