import React, { PropTypes } from 'react';
import prettyBytes from 'pretty-bytes';
import { FormattedNumber, FormattedDate, FormattedTime, FormattedMessage } from 'react-intl';

const SupplementaryFilesTableRow = ({
  name,
  hashName,
  size,
  uploadedAt
}) => (
  <tr>
    <td>
      {name}
    </td>
    <td>
      {hashName}
    </td>
    <td>
      {prettyBytes(size)}
    </td>
    <td>
      <FormattedDate value={uploadedAt * 1000} />&nbsp;<FormattedTime value={uploadedAt * 1000} />
    </td>
  </tr>
);

SupplementaryFilesTableRow.propTypes = {
  name: PropTypes.string.isRequired,
  hashName: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired
};

export default SupplementaryFilesTableRow;
