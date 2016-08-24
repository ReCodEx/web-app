import { createSelector } from 'reselect';

const getInstances = state => state.instances;
const getResources = instances => instances.get('resources');

export const instancesSelector = createSelector(getInstances, getResources);
