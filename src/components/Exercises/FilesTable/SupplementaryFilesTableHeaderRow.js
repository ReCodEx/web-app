import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

const SupplementaryFilesTableHeaderRow = ({ viewOnly }) => (
  <tr>
    <th>
      <FormattedMessage id="app.uploadFiles.fileName" defaultMessage="File Name" />
    </th>
    <th>
      <FormattedMessage id="generic.size" defaultMessage="Size" />
    </th>
    <th>
      <FormattedMessage id="generic.uploadedAt" defaultMessage="Uploaded at" />
    </th>
    {!viewOnly && <th />}
  </tr>
);

SupplementaryFilesTableHeaderRow.propTypes = {
  viewOnly: PropTypes.bool,
};

export default SupplementaryFilesTableHeaderRow;
