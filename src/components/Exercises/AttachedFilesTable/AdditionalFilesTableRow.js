import React from 'react';
import PropTypes from 'prop-types';
import prettyBytes from 'pretty-bytes';
import { FormattedDate, FormattedTime } from 'react-intl';
import withLinks from '../../../hoc/withLinks';

const AdditionalFilesTableRow = (
  {
    id,
    name,
    size,
    uploadedAt,
    links: { DOWNLOAD }
  }
) => (
  <tr>
    <td>{name}</td>
    <td><a href={DOWNLOAD(id)} target="_blank">{DOWNLOAD(id)}</a></td>
    <td>{prettyBytes(size)}</td>
    <td>
      <FormattedDate value={uploadedAt * 1000} />
      &nbsp;
      <FormattedTime value={uploadedAt * 1000} />
    </td>
  </tr>
);

AdditionalFilesTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired,
  links: PropTypes.object.isRequired
};

export default withLinks(AdditionalFilesTableRow);
