import React, { PropTypes } from 'react';
import prettyBytes from 'pretty-bytes';
import { FormattedDate, FormattedTime } from 'react-intl';

const AdditionalFilesTableRow = (
  {
    name,
    downloadUrl,
    size,
    uploadedAt
  }
) => (
  <tr>
    <td>{name}</td>
    <td><a href={downloadUrl} target="_blank">{downloadUrl}</a></td>
    <td>{prettyBytes(size)}</td>
    <td>
      <FormattedDate value={uploadedAt * 1000} />
      &nbsp;
      <FormattedTime value={uploadedAt * 1000} />
    </td>
  </tr>
);

AdditionalFilesTableRow.propTypes = {
  name: PropTypes.string.isRequired,
  downloadUrl: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired
};

export default AdditionalFilesTableRow;
