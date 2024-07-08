import { createSelector } from 'reselect';
import { fetchManyEndpoint } from '../modules/sisTerms.js';
import { isReady, getJsData } from '../helpers/resourceManager';

const getTerms = state => state.sisTerms;
const getResources = exercises => exercises.get('resources');

export const termsSelector = createSelector(getTerms, getResources);
export const termSelector = termId => createSelector(termsSelector, terms => terms.get(termId));

export const fetchManyStatus = createSelector(getTerms, state => state.getIn(['fetchManyStatus', fetchManyEndpoint]));

export const readySisTermsSelector = createSelector(termsSelector, terms =>
  terms
    .toList()
    .filter(isReady)
    .map(getJsData)
    .sort((a, b) => a.year * 10 + a.term < b.year * 10 + b.term)
    .toArray()
);
