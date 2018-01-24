import { defaultMemoize } from 'reselect';

export const computeVisibleGroupsMap = defaultMemoize(groups => {
  const res = {};
  groups
    .filter(group => group.getIn(['data', 'canView']))
    .forEach((group, id) => {
      res[id] = true;
      group.getIn(['data', 'parentGroupsIds'], []).forEach(parentId => {
        res[parentId] = true;
      });
    });

  return res;
});
