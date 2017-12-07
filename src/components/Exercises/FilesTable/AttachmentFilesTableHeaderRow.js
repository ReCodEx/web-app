import React from 'react';
import { FormattedMessage } from 'react-intl';

const AttachmentFilesTableHeaderRow = () =>
  <tr>
    <th>
      <FormattedMessage
        id="app.attachmentFilesTable.fileName"
        defaultMessage="Original filename"
      />
    </th>
    <th>
      <FormattedMessage
        id="app.attachmentFilesTable.url"
        defaultMessage="URL"
      />
    </th>
    <th>
      <FormattedMessage
        id="app.attachmentFilesTable.fileSize"
        defaultMessage="Filesize"
      />
    </th>
    <th>
      <FormattedMessage
        id="app.attachmentFilesTable.fileUploadedAt"
        defaultMessage="Uploaded at"
      />
    </th>
    <th />
  </tr>;

export default AttachmentFilesTableHeaderRow;
