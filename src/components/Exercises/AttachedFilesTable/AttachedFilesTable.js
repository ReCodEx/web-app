import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import Icon from 'react-fontawesome';
import { Table } from 'react-bootstrap';
import Button from '../../widgets/FlatButton';
import Box from '../../widgets/Box';
import { SendIcon } from '../../icons';

import UploadContainer from '../../../containers/UploadContainer';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const AttachedFilesTable = (
  {
    title = (
      <FormattedMessage
        id="app.attachedFilesTable.title"
        defaultMessage="Attached files"
      />
    ),
    description = null,
    attachments,
    canSubmit,
    newFiles,
    addFiles,
    uploadId,
    HeaderComponent,
    RowComponent
  }
) => (
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
            <SendIcon />
            {' '}
            <FormattedMessage
              id="app.attachedFilesTable.addFiles"
              defaultMessage="Save files"
            />
          </Button>
        </p>}

      <ResourceRenderer resource={attachments.toArray()}>
        {(...attachments) => (
          <div>
            {attachments.length > 0 &&
              <Table responsive>
                <thead>
                  <HeaderComponent />
                </thead>
                <tbody>
                  {attachments
                    .sort((a, b) => a.name < b.name ? -1 : +(a.name > b.name)) // sort lexicographicaly
                    .map((data, i) => <RowComponent {...data} key={data.id} />)}
                </tbody>
              </Table>}
            {attachments.length === 0 &&
              <p className="text-center">
                <Icon name="folder-open-o" />
                {' '}
                <FormattedMessage
                  id="app.attachedFilesTable.empty"
                  defaultMessage="There are no uploaded files yet."
                />
              </p>}
          </div>
        )}
      </ResourceRenderer>
    </div>
  </Box>
);

AttachedFilesTable.propTypes = {
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
  HeaderComponent: PropTypes.func.isRequired,
  RowComponent: PropTypes.func.isRequired
};

export default AttachedFilesTable;
