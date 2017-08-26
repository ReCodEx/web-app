import { createSelector } from 'reselect';
import { isReady } from '../helpers/resourceManager';

const getResources = state => state.boxes.get('resources');

export const getBoxTypesNames = createSelector(getResources, resources =>
  Object.keys(resources.toJS())
);
export const getBoxTypes = createSelector(getResources, resources =>
  resources.filter(isReady).toList().toJS().map(item => item.data)
);
