import React from 'react';
import { FormattedMessage } from 'react-intl';

const AdditionalFilesTableHeaderRow = () =>
  <tr>
    <th>
      <FormattedMessage
        id="app.additionalFilesTable.fileName"
        defaultMessage="Original filename"
      />
    </th>
    <th>
      <FormattedMessage
        id="app.additionalFilesTable.url"
        defaultMessage="URL"
      />
    </th>
    <th>
      <FormattedMessage
        id="app.additionalFilesTable.fileSize"
        defaultMessage="Filesize"
      />
    </th>
    <th>
      <FormattedMessage
        id="app.additionalFilesTable.fileUploadedAt"
        defaultMessage="Uploaded at"
      />
    </th>
    <th />
  </tr>;

export default AdditionalFilesTableHeaderRow;
