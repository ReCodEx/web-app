import { handleActions } from 'redux-actions';
import factory, { initialState, getJsData } from '../helpers/resourceManager';
import { createApiAction } from '../middleware/apiMiddleware';
import { getFile } from '../selectors/files';
import { saveAs } from 'file-saver';

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

export const download = id => (dispatch, getState) =>
  dispatch(fetchFileIfNeeded(id))
    .then(() =>
      dispatch(
        createApiAction({
          type: actionTypes.DOWNLOAD,
          method: 'GET',
          endpoint: `/uploaded-files/${id}/download`,
          doNotProcess: true // the response is not (does not have to be) a JSON
        })
      )
    )
    .then(({ value }) => value.blob())
    .then(blob => {
      const file = getJsData(getFile(id)(getState())); // the file is 100% loaded at this time
      saveAs(blob, file.name);
      return Promise.resolve();
    });

/**
 * Reducer
 */

const reducer = handleActions(reduceActions, initialState);

export default reducer;
