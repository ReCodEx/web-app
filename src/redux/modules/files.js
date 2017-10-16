import { handleActions } from 'redux-actions';
import factory, { initialState, getJsData } from '../helpers/resourceManager';
import { getFile } from '../selectors/files';
import { downloadHelper } from '../helpers/api/download';

const resourceName = 'files';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/uploaded-files/${id}`
});

/**
 * Actions
 */

const actionTypes = {
  DOWNLOAD: 'recodex/files/DOWNLOAD'
};

export const loadFile = actions.pushResource;
export const fetchFileIfNeeded = actions.fetchOneIfNeeded;

export const download = downloadHelper({
  endpoint: id => `/uploaded-files/${id}/download`,
  fetch: fetchFileIfNeeded,
  actionType: actionTypes.DOWNLOAD,
  fileNameSelector: (id, state) => `${getJsData(getFile(id)(state)).name}.zip`,
  contentType: 'application/zip'
});
export const downloadSupplementaryFile = downloadHelper({
  endpoint: id => `/uploaded-files/supplementary-file/${id}/download`,
  fetch: fetchFileIfNeeded,
  actionType: actionTypes.DOWNLOAD,
  fileNameSelector: (id, state) => `${getJsData(getFile(id)(state)).name}.zip`,
  contentType: 'application/zip'
});

/**
 * Reducer
 */

const reducer = handleActions(reduceActions, initialState);

export default reducer;
