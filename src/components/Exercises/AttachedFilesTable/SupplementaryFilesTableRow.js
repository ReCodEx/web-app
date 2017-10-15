import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import prettyBytes from 'pretty-bytes';
import { FormattedDate, FormattedTime } from 'react-intl';
import { downloadSupplementaryFile } from '../../../redux/modules/files';

const SupplementaryFilesTableRow = ({
  id,
  name,
  hashName,
  size,
  uploadedAt,
  downloadFile
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
  </tr>;

SupplementaryFilesTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  hashName: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired,
  downloadFile: PropTypes.func.isRequired
};

export default connect(
  (state, props) => ({}),
  (dispatch, { id }) => ({
    downloadFile: e => {
      e.preventDefault();
      dispatch(downloadSupplementaryFile(id));
    }
  })
)(SupplementaryFilesTableRow);
