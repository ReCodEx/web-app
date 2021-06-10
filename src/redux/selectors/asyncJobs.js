import { createSelector } from 'reselect';

const getAsyncJobs = state => state.asyncJobs;
export const getAllAsyncJobs = createSelector(getAsyncJobs, jobs => jobs.get('resources'));

export const getAsyncJob = createSelector(getAsyncJobs, jobs => id => jobs.getIn(['resources', id]));

export const getPingStatus = createSelector(getAsyncJobs, jobs => jobs.get('ping', null));
