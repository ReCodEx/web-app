import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import { prettyPrintBytes } from '../../helpers/stringFormatters';
import withLinks from '../../../helpers/withLinks';
import Button from '../../widgets/FlatButton';
import DateTime from '../../widgets/DateTime';
import Confirm from '../../../components/forms/Confirm';
import { DeleteIcon } from '../../../components/icons';

const AttachmentFilesTableRow = ({
  id,
  name,
  size,
  uploadedAt,
  removeFile,
  links: { DOWNLOAD }
}) =>
  <tr>
    <td>
      {name}
    </td>
    <td>
      <a href={DOWNLOAD(id)} target="_blank" rel="noopener noreferrer">
        {DOWNLOAD(id)}
      </a>
    </td>
    <td>
      {prettyPrintBytes(size)}
    </td>
    <td>
      <DateTime unixts={uploadedAt} showRelative />
    </td>
    <td>
      {removeFile &&
        <Confirm
          id={id}
          onConfirmed={() => removeFile(id)}
          question={
            <FormattedMessage
              id="app.attachmentFiles.deleteConfirm"
              defaultMessage="Are you sure you want to delete the file? This cannot be undone."
            />
          }
          className="pull-right"
        >
          <Button bsSize="xs" bsStyle="danger">
            <DeleteIcon gapRight />
            <FormattedMessage id="generic.delete" defaultMessage="Delete" />
          </Button>
        </Confirm>}
    </td>
  </tr>;

AttachmentFilesTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired,
  links: PropTypes.object.isRequired,
  removeFile: PropTypes.func
};

export default withLinks(AttachmentFilesTableRow);
