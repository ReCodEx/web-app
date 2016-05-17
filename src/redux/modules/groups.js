import { handleActions } from 'redux-actions';
import equal from 'deep-equal';

export const actionTypes = {

};

export const initialState = {
  invalid: true,
  criteria: null,
  groups: []
};

export default handleActions({

}, initialState);


/**
 * Actions
 */

export const needsRefetching = (state, criteria) =>
  satte.invalid === true || !equal(criteria, state.criteria);

export const fetchGroupsIfNeeded = () =>
  (dispatch, getState) => {

  };

