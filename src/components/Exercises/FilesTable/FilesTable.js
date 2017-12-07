import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { injectIntl, FormattedMessage } from 'react-intl';

import Icon from 'react-fontawesome';
import { Table } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';
import Box from '../../widgets/Box';
import { SendIcon } from '../../icons';

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
  intl
}) =>
  <Box title={title} collapsable isOpen>
    <div>
      {description &&
        <p>
          {description}
        </p>}
      <UploadContainer id={uploadId} />
      {newFiles.size > 0 &&
        <p className="text-center">
          <Button
            bsStyle="success"
            disabled={!canSubmit}
            onClick={() => addFiles(newFiles)}
          >
            <SendIcon />{' '}
            <FormattedMessage
              id="app.filesTable.addFiles"
              defaultMessage="Save files"
            />
          </Button>
        </p>}

      <ResourceRenderer resource={attachments.toArray()}>
        {(...attachments) =>
          <div>
            {attachments.length > 0 &&
              <Table responsive>
                <thead>
                  <HeaderComponent />
                </thead>
                <tbody>
                  {attachments
                    .sort((a, b) => a.name.localeCompare(b.name, intl.locale))
                    .map((data, i) =>
                      <RowComponent
                        {...data}
                        removeFile={removeFile}
                        downloadFile={downloadFile}
                        key={i}
                      />
                    )}
                </tbody>
              </Table>}
            {attachments.length === 0 &&
              <p className="text-center">
                <Icon name="folder-open-o" />{' '}
                <FormattedMessage
                  id="app.filesTable.empty"
                  defaultMessage="There are no uploaded files yet."
                />
              </p>}
          </div>}
      </ResourceRenderer>
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
  newFiles: ImmutablePropTypes.list,
  addFiles: PropTypes.func,
  removeFile: PropTypes.func,
  downloadFile: PropTypes.func,
  HeaderComponent: PropTypes.func.isRequired,
  RowComponent: PropTypes.func.isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(FilesTable);
