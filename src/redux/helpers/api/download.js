import { createApiAction } from '../../middleware/apiMiddleware';
import { saveAs } from 'file-saver';
import { getJsData } from '../resourceManager';
import { addNotification } from '../../modules/notifications';

export const downloadHelper = ({
  fetch,
  endpoint,
  actionType,
  fileSelector
}) => id => (dispatch, getState) =>
  dispatch(fetch(id))
    .then(() =>
      dispatch(
        createApiAction({
          type: actionType,
          method: 'GET',
          endpoint: endpoint(id),
          doNotProcess: true // the response is not (does not have to be) a JSON
        })
      )
    )
    .then(result => {
      const { value: { ok, status } } = result;
      if (ok === false) {
        const msg =
          status === 404
            ? 'The file could not be found on the server.'
            : `This file cannot be downloaded (${status}).`;
        throw new Error(msg);
      }

      return result;
    })
    .then(({ value }) => value.blob())
    .then(blob => {
      const typedBlob = new Blob([blob], { type: 'text/plain;charset=utf-8' });
      const file = getJsData(fileSelector(id)(getState())); // the file is 100% loaded at this time
      saveAs(typedBlob, file.name);
      return Promise.resolve();
    })
    .catch(e => dispatch(addNotification(e.message, false)));
