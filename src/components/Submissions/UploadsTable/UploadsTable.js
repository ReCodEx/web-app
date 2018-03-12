import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';
import { Table, Button, ButtonGroup } from 'react-bootstrap';
import { prettyPrintBytes } from '../../helpers/stringFormatters';

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
            id="app.uploadsTable.fileName"
            defaultMessage="File Name"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.uploadsTable.fileSize"
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
            <Icon name="check" className="text-success text-bold" />
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
              <Icon name="trash" />
            </Button>
          </td>
        </tr>
      )}

      {uploadingFiles.map(payload =>
        <tr key={'uploading-' + payload.name}>
          <td className="text-center">
            <Icon name="circle-o" spin />
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
            <Icon name="exclamation-triangle" className="text-danger" />
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
                <Icon name="trash" />
              </Button>
              <Button
                bsSize="xs"
                bsStyle="default"
                onClick={() => retryUploadFile(payload)}
              >
                <Icon name="refresh" />
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      )}

      {removedFiles.map(payload =>
        <tr key={'removed' + payload.name}>
          <td className="text-center">
            <Icon name="trash" className="text-warning" />
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
                <Icon name="refresh" />
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
