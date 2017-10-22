import React from 'react';
import { FormattedMessage } from 'react-intl';

const SupplementaryFilesTableHeaderRow = () =>
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
    <th />
  </tr>;

export default SupplementaryFilesTableHeaderRow;
