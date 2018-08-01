import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table, Button, ButtonGroup } from 'react-bootstrap';
import { prettyPrintBytes } from '../../helpers/stringFormatters';
import Icon, { DeleteIcon } from '../../icons';

const UploadsTable = ({
  uploadingFiles = [],
  attachedFiles = [],
  failedFiles = [],
  removedFiles = [],
  removeFile,
  returnFile,
  removeFailedFile,
  retryUploadFile
}) =>
  <Table responsive>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage
            id="app.filesTable.fileName"
            defaultMessage="File Name"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.filesTable.fileSize"
            defaultMessage="File Size"
          />
        </th>
        <th />
      </tr>
    </thead>
    <tbody>
      {attachedFiles.map(payload =>
        <tr key={'attached-' + payload.name}>
          <td className="text-center">
            <Icon icon="check" className="text-success text-bold" />
          </td>
          <td>
            {payload.name}
          </td>
          <td>
            {prettyPrintBytes(payload.file.size)}
          </td>
          <td>
            <Button
              bsSize="xs"
              bsStyle="default"
              onClick={() => removeFile(payload)}
            >
              <DeleteIcon />
            </Button>
          </td>
        </tr>
      )}

      {uploadingFiles.map(payload =>
        <tr key={'uploading-' + payload.name}>
          <td className="text-center">
            <Icon icon="sync" spin />
          </td>
          <td>
            {payload.name}
          </td>
          <td>
            {prettyPrintBytes(payload.file.size)}
          </td>
          <td />
        </tr>
      )}

      {failedFiles.map(payload =>
        <tr key={'failed-' + payload.name}>
          <td className="text-center">
            <Icon icon="exclamation-triangle" className="text-danger" />
          </td>
          <td>
            {payload.name}
          </td>
          <td>
            {prettyPrintBytes(payload.file.size)}
          </td>
          <td>
            <ButtonGroup>
              <Button
                bsSize="xs"
                bsStyle="default"
                onClick={() => removeFailedFile(payload)}
              >
                <DeleteIcon />
              </Button>
              <Button
                bsSize="xs"
                bsStyle="default"
                onClick={() => retryUploadFile(payload)}
              >
                <Icon icon="sync" />
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      )}

      {removedFiles.map(payload =>
        <tr key={'removed' + payload.name}>
          <td className="text-center">
            <DeleteIcon className="text-warning" />
          </td>
          <td>
            {payload.name}
          </td>
          <td>
            {prettyPrintBytes(payload.file.size)}
          </td>
          <td>
            <ButtonGroup>
              <Button
                bsSize="xs"
                bsStyle="default"
                onClick={() => returnFile(payload)}
              >
                <Icon icon="sync" />
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      )}
    </tbody>
  </Table>;

UploadsTable.propTypes = {
  uploadingFiles: PropTypes.array.isRequired,
  attachedFiles: PropTypes.array.isRequired,
  failedFiles: PropTypes.array.isRequired,
  removedFiles: PropTypes.array.isRequired,
  removeFile: PropTypes.func.isRequired,
  removeFailedFile: PropTypes.func.isRequired,
  retryUploadFile: PropTypes.func.isRequired,
  returnFile: PropTypes.func.isRequired
};

export default UploadsTable;
