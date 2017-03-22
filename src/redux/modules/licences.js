import { handleActions } from 'redux-actions';
import { fromJS } from 'immutable';
import factory, { initialState } from '../helpers/resourceManager';

const resourceName = 'licences';
const {
  actions,
  actionTypes,
  reduceActions
} = factory({
  resourceName,
  apiEndpointFactory: (instanceId) => `/instances/${instanceId}/licences`
});

/**
 * Actions
 */

export const fetchLicencesIfNeeded = actions.fetchIfNeeded;
export const fetchLicenceIfNeeded = actions.fetchOneIfNeeded;
export const fetchInstanceLincences = actions.fetchOneIfNeeded;
export const addLicence = (instanceId, body) =>
  actions.addResource(body, instanceId, `/instances/${instanceId}/licences`);

/**
 * Reducer
 */

const reducer = handleActions(Object.assign({}, reduceActions, {

  // the default behavior must be overriden - different indexing
  [actionTypes.ADD_PENDING]: (state, { payload, meta: { tmpId: instanceId } }) =>
    state.updateIn([ 'resources', instanceId, 'data' ], licences => licences.push(fromJS({ id: instanceId, ...payload }))),

  [actionTypes.ADD_FAILED]: (state, { meta: { tmpId: instanceId } }) =>
    state.updateIn([ 'resources', instanceId, 'data' ], licences => licences.filter(licence => licence.get('id') !== instanceId)),

  [actionTypes.ADD_FULFILLED]: (state, { payload, meta: { tmpId: instanceId } }) =>
    state.updateIn([ 'resources', instanceId, 'data' ], licences => licences.filter(licence => licence.get('id') !== instanceId).push(fromJS(payload)))

}), initialState);

export default reducer;
