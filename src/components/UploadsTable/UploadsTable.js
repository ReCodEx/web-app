import React, { PropTypes } from 'react';
import prettyBytes from 'pretty-bytes';
import Icon from 'react-fontawesome';
import { Table, Button, ButtonGroup } from 'react-bootstrap';

const UploadsTable = ({
  uploadingFiles = [],
  attachedFiles = [],
  failedFiles = [],
  removeFile,
  retryUploadFile
}) => (
  <Table responsive>
    <thead>
      <tr>
        <th></th>
        <th>Název soboru</th>
        <th>Velikost souboru</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {attachedFiles.map(
        file =>
          <tr key={file.name}>
            <td>
              <Icon name='check' className='text-success text-bold' />
            </td>
            <td>{file.name}</td>
            <td>{prettyBytes(file.size)}</td>
            <td>
              <Button bsSize='xs' bsStyle='default' onClick={() => removeFile(file.name)}>
                <Icon name='trash' />
              </Button>
            </td>
          </tr>
      )}

      {uploadingFiles.map(
        file =>
          <tr key={file.name}>
            <td>
              <Icon name='circle-o' spin />
            </td>
            <td>{file.name}</td>
            <td>{prettyBytes(file.size)}</td>
            <td />
          </tr>
      )}

      {failedFiles.map(
        file =>
          <tr key={file.name}>
            <td>
              <Icon name='exclamation-triangle' className='text-danger' />
            </td>
            <td>{file.name}</td>
            <td>{prettyBytes(file.size)}</td>
            <td>
              <ButtonGroup>
                <Button bsSize='xs' bsStyle='default' onClick={() => removeFile(file.name)}>
                  <Icon name='trash' />
                </Button>
                <Button bsSize='xs' bsStyle='default' onClick={() => retryUploadFile(file)}>
                  <Icon name='refresh' />
                </Button>
              </ButtonGroup>
            </td>
          </tr>
      )}
    </tbody>
  </Table>
);

UploadsTable.propTypes = {
  uploadingFiles: PropTypes.array.isRequired,
  attachedFiles: PropTypes.array.isRequired,
  failedFiles: PropTypes.array.isRequired,
  removeFile: PropTypes.func.isRequired,
  retryUploadFile: PropTypes.func.isRequired
};

export default UploadsTable;
