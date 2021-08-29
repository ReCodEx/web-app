import { handleActions } from 'redux-actions';
import factory, { initialState } from '../helpers/resourceManager';

const { actions: assignmentActions, reduceActions: assignmentReducers } = factory({
  resourceName: 'assignmentSolutionFiles',
  apiEndpointFactory: id => `/assignment-solutions/${id}/files`,
});

const { actions: referenceActions, reduceActions: referenceReducers } = factory({
  resourceName: 'referenceSolutionFiles',
  apiEndpointFactory: id => `/reference-solutions/${id}/files`,
});

/**
 * Actions
 */
export const fetchAssignmentSolutionFiles = assignmentActions.fetchResource;
export const fetchAssignmentSolutionFilesIfNeeded = assignmentActions.fetchOneIfNeeded;

export const fetchReferenceSolutionFiles = referenceActions.fetchResource;
export const fetchReferenceSolutionFilesIfNeeded = referenceActions.fetchOneIfNeeded;

/**
 * Reducer
 */

const reducer = handleActions({ ...assignmentReducers, ...referenceReducers }, initialState);
export default reducer;
