import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';
import { objectMap } from '../../helpers/common';

const getResources = state => state.boxes.get('resources');

export const getBoxTypesNames = createSelector(getResources, resources =>
  resources
    .toList()
    .toJS()
    .map(obj => obj.data.name)
);

export const getBoxTypes = createSelector(getResources, resources =>
  objectMap(resources.filter(isReady).toJS(), obj => obj.data)
);
