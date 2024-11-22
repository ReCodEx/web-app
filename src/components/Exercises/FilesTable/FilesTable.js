import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
import { lruMemoize } from 'reselect';

import { Table } from 'react-bootstrap';
import Button, { TheButtonGroup } from '../../widgets/TheButton';
import Icon, { CloseIcon, SaveIcon, ZipIcon } from '../../icons';

import UploadContainer from '../../../containers/UploadContainer';

const indexFileNames = lruMemoize(files => new Set(files.map(file => file.name)));

const FilesTable = ({
  description = null,
  files,
  usedFiles,
  canSubmit,
  newFiles,
  resetUploads,
  addFiles,
  removeFile,
  downloadFile,
  uploadId,
  HeaderComponent,
  RowComponent,
  intl,
  viewOnly = false,
  downloadArchive,
}) => (
  <div>
    {description && <p>{description}</p>}
    {!viewOnly && <UploadContainer id={uploadId} existingFiles={indexFileNames(files)} />}
    {!viewOnly && newFiles && newFiles.length > 0 && (
      <div className="text-center mb-3">
        <TheButtonGroup>
          <Button variant="success" disabled={!canSubmit} onClick={() => addFiles(newFiles)}>
            <SaveIcon gapRight />
            <FormattedMessage id="app.filesTable.saveUploadedFilesButton" defaultMessage="Save Uploaded Files" />
          </Button>
          <Button variant="danger" onClick={resetUploads}>
            <CloseIcon gapRight />
            <FormattedMessage id="generic.clearAll" defaultMessage="Clear All" />
          </Button>
        </TheButtonGroup>
      </div>
    )}

    <div>
      {files.length > 0 && (
        <Table responsive>
          <thead>
            <HeaderComponent viewOnly={viewOnly} />
          </thead>
          <tbody>
            {files
              .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
              .map((fileData, i) => (
                <RowComponent
                  {...fileData}
                  removeFile={removeFile}
                  downloadFile={downloadFile}
                  viewOnly={viewOnly}
                  isBeingUsed={usedFiles && usedFiles.has(fileData.name)}
                  key={i}
                />
              ))}
          </tbody>
        </Table>
      )}

      {files.length === 0 && (
        <p className="text-center p-3">
          <Icon icon={['far', 'folder-open']} gapRight />
          <FormattedMessage id="app.filesTable.empty" defaultMessage="There are no saved files yet." />
        </p>
      )}

      {downloadArchive && files.length > 1 && (
        <div className="text-center">
          <Button variant="primary" onClick={downloadArchive}>
            <ZipIcon gapRight />
            <FormattedMessage id="app.filesTable.downloadArchive" defaultMessage="Download all as ZIP archive" />
          </Button>
        </div>
      )}
    </div>
  </div>
);

FilesTable.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  uploadId: PropTypes.string.isRequired,
  files: PropTypes.array,
  usedFiles: PropTypes.instanceOf(Set),
  canSubmit: PropTypes.bool,
  newFiles: PropTypes.array,
  resetUploads: PropTypes.func.isRequired,
  addFiles: PropTypes.func.isRequired,
  removeFile: PropTypes.func,
  downloadFile: PropTypes.func,
  HeaderComponent: PropTypes.func.isRequired,
  RowComponent: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
  viewOnly: PropTypes.bool,
  downloadArchive: PropTypes.func,
};

export default injectIntl(FilesTable);
