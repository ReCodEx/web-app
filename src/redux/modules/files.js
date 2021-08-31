import { handleActions } from 'redux-actions';
import factory, { initialState, getJsData } from '../helpers/resourceManager';
import { getFile } from '../selectors/files';
import { downloadHelper } from '../helpers/api/download';

const resourceName = 'files';
const { actions, reduceActions } = factory({
  resourceName,
  apiEndpointFactory: id => `/uploaded-files/${id}`,
});

/**
 * Actions
 */

const actionTypes = {
  DOWNLOAD: 'recodex/files/DOWNLOAD',
};

export const loadFile = actions.pushResource;
export const fetchFileIfNeeded = actions.fetchOneIfNeeded;

/**
 * Action creator for uploaded files download. If the uploaded file is a zip, one may use entry
 * parameter to extract only one item from the archive.
 *
 * This actually tweaks download helper a bit. If the entry is null, it behaves as regular download
 * (i.e., with file metadata prefetch, automated name fill-in ...). If the entry is present,
 * no file prefetch is performed and the name is extracted from the entry itself.
 *
 * @param {string} fileId
 * @param {string|null} entry ZIP archive path (works only for zip uploaded files)
 */
export const download = (fileId, entry = null) =>
  downloadHelper({
    endpoint: `/uploaded-files/${fileId}/download` + (entry ? `?entry=${encodeURIComponent(entry)}` : ''),
    fetch: entry ? null : fetchFileIfNeeded,
    actionType: actionTypes.DOWNLOAD,
    fileNameSelector: entry ? null : (id, state) => getJsData(getFile(id)(state)).name,
    contentType: 'application/octet-stream',
  })(fileId, entry && entry.split('/').pop());

export const downloadSupplementaryFile = downloadHelper({
  endpoint: id => `/uploaded-files/supplementary-file/${id}/download`,
  fetch: fetchFileIfNeeded,
  actionType: actionTypes.DOWNLOAD,
  fileNameSelector: (id, state) => getJsData(getFile(id)(state)).name,
  contentType: 'application/octet-stream',
});

/**
 * Reducer
 */

const reducer = handleActions(reduceActions, initialState);

export default reducer;
