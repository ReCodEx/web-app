import { createApiAction } from '../../middleware/apiMiddleware';
import { addNotification } from '../../modules/notifications';

const trivialFileNameSelector = (id, _) => id;

export const downloadHelper =
  ({ fetch = null, endpoint, actionType, fileNameSelector = trivialFileNameSelector, contentType }) =>
  (id, fileName = null) =>
  (dispatch, getState) => {
    let initial;
    if (fetch !== null) {
      initial = dispatch(fetch(id));
    } else {
      initial = Promise.resolve();
    }
    return initial
      .then(() =>
        dispatch(
          createApiAction({
            type: actionType,
            method: 'GET',
            endpoint: endpoint instanceof Function ? endpoint(id) : endpoint,
            doNotProcess: true, // the response is not (does not have to be) a JSON
          })
        )
      )
      .then(result => {
        const {
          value: { ok, status },
        } = result;
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
        const { saveAs } = require('file-saver'); // dynamic loading, to avoid errors in headles nodejs execution
        const typedBlob = new Blob([blob], { type: contentType });
        fileName = fileName || fileNameSelector(id, getState());
        saveAs(typedBlob, fileName, { autoBom: false });
        return Promise.resolve();
      })
      .catch(e => dispatch(addNotification(e.message, false)));
  };

export const downloadString = (fileName, data, contentType, addBOM = false) => {
  const { saveAs } = require('file-saver'); // dynamic loading, to avoid errors in headles nodejs execution
  const blobData = addBOM ? [new Uint8Array([0xef, 0xbb, 0xbf])] : [];
  blobData.push(data);
  const typedBlob = new Blob(blobData, { type: contentType });
  saveAs(typedBlob, fileName, { autoBom: false });
  return Promise.resolve();
};
