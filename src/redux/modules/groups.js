import { handleActions } from 'redux-actions';
import equal from 'deep-equal';
import { usersGroups, allGroups } from '../selectors/usersGroups';

export const actionTypes = {

};

export const initialState = {
  isLoading: false,
  userId: null,
  groups: []
};

export default handleActions({

}, initialState);


/**
 * Actions
 */

export const fetchGroupsForUser = (userId, forceFetch = false) =>
  (dispatch, getState) => {
    if (userId !== getState().groups.userId || forceFetch === true) {
      const memberOf = usersGroups(getState());
      const available = allGroups(getState());
      const missing = memberOf.filter(group => available.indexOf(group) === -1);

      // @todo dispatch API call to fetch all the information of these groups for the user
    }
  };

