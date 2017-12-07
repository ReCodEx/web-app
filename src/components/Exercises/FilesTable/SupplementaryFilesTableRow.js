import React from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import Confirm from '../../../components/forms/Confirm';
import { DeleteIcon } from '../../../components/icons';

const SupplementaryFilesTableRow = ({
  id,
  name,
  hashName,
  size,
  uploadedAt,
  downloadFile,
  removeFile
}) =>
  <tr>
    <td>
      {downloadFile
        ? <a href="#" onClick={e => downloadFile(e, id)}>
            {name}
          </a>
        : <span>
            {name}
          </span>}
    </td>
    <td>
      {prettyBytes(size)}
    </td>
    <td>
      <FormattedDate value={uploadedAt * 1000} />
      &nbsp;
      <FormattedTime value={uploadedAt * 1000} />
    </td>
    <td>
      {removeFile &&
        <Confirm
          id={id}
          onConfirmed={() => removeFile(id)}
          question={
            <FormattedMessage
              id="app.supplementaryFiles.deleteConfirm"
              defaultMessage="Are you sure you want to delete the file? This cannot be undone."
            />
          }
          className="pull-right"
        >
          <Button bsSize="xs" className="btn-flat" bsStyle="danger">
            <DeleteIcon />{' '}
            <FormattedMessage
              id="app.supplementaryFiles.deleteButton"
              defaultMessage="Delete"
            />
          </Button>
        </Confirm>}
    </td>
  </tr>;

SupplementaryFilesTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  hashName: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired,
  downloadFile: PropTypes.func,
  removeFile: PropTypes.func
};

export default SupplementaryFilesTableRow;
