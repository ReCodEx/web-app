import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import Confirm from '../../../components/forms/Confirm';
import { DeleteIcon } from '../../../components/icons';
import { downloadSupplementaryFile } from '../../../redux/modules/files';
import { removeSupplementaryFile } from '../../../redux/modules/supplementaryFiles';

const SupplementaryFilesTableRow = ({
  id,
  name,
  hashName,
  size,
  uploadedAt,
  downloadFile,
  removeSupplementaryFile
}) =>
  <tr>
    <td>
      <a href="#" onClick={downloadFile}>
        {name}
      </a>
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
      <Confirm
        id={id}
        onConfirmed={() => removeSupplementaryFile(id)}
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
      </Confirm>
    </td>
  </tr>;

SupplementaryFilesTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  hashName: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired,
  downloadFile: PropTypes.func.isRequired,
  removeSupplementaryFile: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({}),
  (dispatch, { id }) => ({
    downloadFile: e => {
      e.preventDefault();
      dispatch(downloadSupplementaryFile(id));
    },
    removeSupplementaryFile: fileId => dispatch(removeSupplementaryFile(fileId))
  })
)(SupplementaryFilesTableRow);
