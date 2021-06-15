import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';

import { Table } from 'react-bootstrap';
import Button from '../../widgets/TheButton';
import Icon, { SendIcon, DownloadIcon } from '../../icons';

import UploadContainer from '../../../containers/UploadContainer';

const FilesTable = ({
  description = null,
  files,
  usedFiles,
  canSubmit,
  newFiles,
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
    {!viewOnly && <UploadContainer id={uploadId} />}
    {!viewOnly && newFiles && newFiles.length > 0 && (
      <p className="text-center">
        <Button variant="success" disabled={!canSubmit} onClick={() => addFiles(newFiles)}>
          <SendIcon gapRight />
          <FormattedMessage id="app.filesTable.addFiles" defaultMessage="Save files" />
        </Button>
      </p>
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
        <p className="text-center em-padding">
          <Icon icon={['far', 'folder-open']} gapRight />
          <FormattedMessage id="app.filesTable.empty" defaultMessage="There are no uploaded files yet." />
        </p>
      )}

      {downloadArchive && files.length > 1 && (
        <div className="text-center">
          <Button variant="primary" onClick={downloadArchive}>
            <DownloadIcon gapRight />
            <FormattedMessage id="app.filesTable.downloadArchive" defaultMessage="Download All" />
          </Button>
        </div>
      )}
    </div>
  </div>
);

FilesTable.propTypes = {
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element,
  ]),
  uploadId: PropTypes.string.isRequired,
  files: PropTypes.array,
  usedFiles: PropTypes.instanceOf(Set),
  canSubmit: PropTypes.bool,
  newFiles: PropTypes.array,
  addFiles: PropTypes.func,
  removeFile: PropTypes.func,
  downloadFile: PropTypes.func,
  HeaderComponent: PropTypes.func.isRequired,
  RowComponent: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
  viewOnly: PropTypes.bool,
  downloadArchive: PropTypes.func,
};

export default injectIntl(FilesTable);
