import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import Button from '../../widgets/FlatButton';
import DateTime from '../../widgets/DateTime';
import { prettyPrintBytes } from '../../helpers/stringFormatters';
import Confirm from '../../../components/forms/Confirm';
import Icon, { DeleteIcon } from '../../../components/icons';

const SupplementaryFilesTableRow = ({
  id,
  name,
  size,
  uploadedAt,
  downloadFile,
  removeFile,
  viewOnly,
  isBeingUsed = false,
}) => (
  <tr>
    <td>
      {downloadFile ? (
        <a href="#" onClick={e => downloadFile(e, id)}>
          {name}
        </a>
      ) : (
        <span>{name}</span>
      )}
    </td>
    <td>{prettyPrintBytes(size)}</td>
    <td>
      <DateTime unixts={uploadedAt} showRelative />
    </td>
    {!viewOnly && (
      <td className="text-right">
        {removeFile &&
          (!isBeingUsed ? (
            <Confirm
              id={id}
              onConfirmed={() => removeFile(id)}
              question={
                <FormattedMessage
                  id="app.supplementaryFiles.deleteConfirm"
                  defaultMessage="Are you sure you want to delete the file? This cannot be undone."
                />
              }
              className="pull-right">
              <Button bsSize="xs" bsStyle="danger">
                <DeleteIcon gapRight />
                <FormattedMessage id="generic.delete" defaultMessage="Delete" />
              </Button>
            </Confirm>
          ) : (
            <OverlayTrigger
              placement="bottom"
              overlay={
                <Tooltip id={`cannot-delete-${id}`}>
                  <FormattedMessage
                    id="app.supplementaryFiles.cannotDeleteExplain"
                    defaultMessage="The file cannot be deleted since it is being used in the configuration."
                  />
                </Tooltip>
              }>
              <em className="text-muted">
                <Icon icon="paperclip" gapRight className="text-success" />
                <FormattedMessage id="generic.inUse" defaultMessage="in use" />
              </em>
            </OverlayTrigger>
          ))}
      </td>
    )}
  </tr>
);

SupplementaryFilesTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  uploadedAt: PropTypes.number.isRequired,
  downloadFile: PropTypes.func,
  removeFile: PropTypes.func,
  viewOnly: PropTypes.bool,
  isBeingUsed: PropTypes.bool,
};

export default SupplementaryFilesTableRow;
