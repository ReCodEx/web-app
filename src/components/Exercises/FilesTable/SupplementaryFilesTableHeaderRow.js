import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

const SupplementaryFilesTableHeaderRow = ({ viewOnly }) =>
  <tr>
    <th>
      <FormattedMessage
        id="app.supplementaryFilesTable.fileName"
        defaultMessage="Original filename"
      />
    </th>
    <th>
      <FormattedMessage
        id="app.supplementaryFilesTable.fileSize"
        defaultMessage="Filesize"
      />
    </th>
    <th>
      <FormattedMessage
        id="app.supplementaryFilesTable.fileUploadedAt"
        defaultMessage="Uploaded at"
      />
    </th>
    {!viewOnly && <th />}
  </tr>;

SupplementaryFilesTableHeaderRow.propTypes = {
  viewOnly: PropTypes.bool
};

export default SupplementaryFilesTableHeaderRow;
