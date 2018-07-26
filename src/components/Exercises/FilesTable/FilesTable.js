import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';

import { Table } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';
import Box from '../../widgets/Box';
import Icon, { SendIcon, DownloadIcon } from '../../icons';

import UploadContainer from '../../../containers/UploadContainer';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const FilesTable = ({
  title = (
    <FormattedMessage
      id="app.filesTable.title"
      defaultMessage="Attached files"
    />
  ),
  description = null,
  attachments,
  canSubmit,
  newFiles,
  addFiles,
  removeFile,
  downloadFile,
  uploadId,
  HeaderComponent,
  RowComponent,
  intl,
  isOpen = true,
  viewOnly = false,
  downloadArchive
}) =>
  <Box title={title} collapsable isOpen={isOpen} unlimitedHeight>
    <div>
      {description &&
        <p>
          {description}
        </p>}
      {!viewOnly && <UploadContainer id={uploadId} />}
      {!viewOnly &&
        newFiles &&
        newFiles.length > 0 &&
        <p className="text-center">
          <Button
            bsStyle="success"
            disabled={!canSubmit}
            onClick={() => addFiles(newFiles)}
          >
            <SendIcon gapRight />
            <FormattedMessage
              id="app.filesTable.addFiles"
              defaultMessage="Save files"
            />
          </Button>
        </p>}

      <ResourceRenderer resource={attachments.toArray()} returnAsArray={true}>
        {attachments =>
          <div>
            {attachments.length > 0 &&
              <Table responsive>
                <thead>
                  <HeaderComponent viewOnly={viewOnly} />
                </thead>
                <tbody>
                  {attachments
                    .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
                    .map((data, i) =>
                      <RowComponent
                        {...data}
                        removeFile={removeFile}
                        downloadFile={downloadFile}
                        viewOnly={viewOnly}
                        key={i}
                      />
                    )}
                </tbody>
              </Table>}
            {attachments.length === 0 &&
              <p className="text-center">
                <Icon icon={['far', 'folder-open']} gapRight />
                <FormattedMessage
                  id="app.filesTable.empty"
                  defaultMessage="There are no uploaded files yet."
                />
              </p>}
          </div>}
      </ResourceRenderer>
      {downloadArchive &&
        attachments.length > 0 &&
        <div className="text-center">
          <Button bsStyle="primary" onClick={downloadArchive}>
            <DownloadIcon gapRight />
            <FormattedMessage
              id="app.filesTable.downloadArchive"
              defaultMessage="Download all"
            />
          </Button>
        </div>}
    </div>
  </Box>;

FilesTable.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]),
  description: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]),
  uploadId: PropTypes.string.isRequired,
  attachments: ImmutablePropTypes.map,
  canSubmit: PropTypes.bool,
  newFiles: PropTypes.array,
  addFiles: PropTypes.func,
  removeFile: PropTypes.func,
  downloadFile: PropTypes.func,
  HeaderComponent: PropTypes.func.isRequired,
  RowComponent: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
  isOpen: PropTypes.bool,
  viewOnly: PropTypes.bool,
  downloadArchive: PropTypes.func
};

export default injectIntl(FilesTable);
