import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
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
            <FontAwesomeIcon icon="check" className="text-success text-bold" />
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
              <FontAwesomeIcon icon="trash" />
            </Button>
          </td>
        </tr>
      )}

      {uploadingFiles.map(payload =>
        <tr key={'uploading-' + payload.name}>
          <td className="text-center">
            <FontAwesomeIcon icon="sync" spin />
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
            <FontAwesomeIcon
              icon="exclamation-triangle"
              className="text-danger"
            />
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
                <FontAwesomeIcon icon="trash" />
              </Button>
              <Button
                bsSize="xs"
                bsStyle="default"
                onClick={() => retryUploadFile(payload)}
              >
                <FontAwesomeIcon icon="refresh" />
              </Button>
            </ButtonGroup>
          </td>
        </tr>
      )}

      {removedFiles.map(payload =>
        <tr key={'removed' + payload.name}>
          <td className="text-center">
            <FontAwesomeIcon icon="trash" className="text-warning" />
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
                <FontAwesomeIcon icon="refresh" />
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
