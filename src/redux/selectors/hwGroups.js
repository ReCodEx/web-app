import { createSelector } from 'reselect';

const getHwGroups = state => state.hwGroups;

export const hardwareGroupsSelector = createSelector(
  getHwGroups,
  groups => groups.get('resources')
);

export const hardwareGroupsIdsSelector = createSelector(
  hardwareGroupsSelector,
  groups => groups.keySeq().toArray()
);
