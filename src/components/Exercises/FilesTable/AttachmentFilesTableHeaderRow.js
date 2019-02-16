import React from 'react';
import { FormattedMessage } from 'react-intl';

const AttachmentFilesTableHeaderRow = () => (
  <tr>
    <th>
      <FormattedMessage id="app.filesTable.originalFileName" defaultMessage="Original File Name" />
    </th>
    <th>
      <FormattedMessage id="app.attachmentFilesTable.url" defaultMessage="URL" />
    </th>
    <th>
      <FormattedMessage id="app.filesTable.fileSize" defaultMessage="File Size" />
    </th>
    <th>
      <FormattedMessage id="generic.uploadedAt" defaultMessage="Uploaded at" />
    </th>
    <th />
  </tr>
);

export default AttachmentFilesTableHeaderRow;
