import { createSelector } from 'reselect';

const getResources = state => state.sisStatus.get('resources');

export const sisStateSelector = createSelector(
  getResources,
  resources => resources.get('status')
);
