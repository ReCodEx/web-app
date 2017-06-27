import { createSelector } from 'reselect';

const getPipelines = state => state.pipelines;

export const pipelinesSelector = exerciseId =>
  createSelector(getPipelines, licences =>
    licences.getIn(['resources', exerciseId])
  );
