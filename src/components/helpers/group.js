import { defaultMemoize } from 'reselect';

const computeMap = (groups, filter) => {
  const res = {};
  groups.filter(filter).forEach((group, id) => {
    res[id] = true;
    (group.getIn(['data', 'parentGroupsIds'], []) || []).forEach(parentId => {
      res[parentId] = true;
    });
  });

  return res;
};

export const computeVisibleGroupsMap = defaultMemoize(groups =>
  computeMap(groups, group => group.getIn(['data', 'permissionHints', 'viewDetail']))
);

export const computeEditableGroupsMap = defaultMemoize(groups =>
  computeMap(groups, group => group.getIn(['data', 'permissionHints', 'update']))
);
