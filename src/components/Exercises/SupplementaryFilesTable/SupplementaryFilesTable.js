import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import Icon from 'react-fontawesome';
import { Button, Table } from 'react-bootstrap';
import Box from '../../AdminLTE/Box';
import { SendIcon } from '../../Icons';

import UploadContainer from '../../../containers/UploadContainer';

import ResourceRenderer from '../../ResourceRenderer';
import SupplementaryFilesTableRow from './SupplementaryFilesTableRow';

const SupplementaryFilesTable = ({
  supplementaryFiles,
  canSubmit,
  newFiles,
  addSupplementaryFiles,
  uploadId
}) => (
  <Box title={<FormattedMessage id='app.supplementaryFilesTable.title' defaultMessage='Supplementary Files' />} collapsable isOpen>
    <div>
      <p>
        <FormattedMessage id='app.supplementaryFilesTable.description' defaultMessage='Supplementary files are files which can be used in job configuration.' />
      </p>
      <UploadContainer id={uploadId} />
      {newFiles.size > 0 && (
        <p className='text-center'>
          <Button
            bsStyle='success'
            disabled={!canSubmit}
            className='btn-flat'
            onClick={() => addSupplementaryFiles(newFiles)}>
            <SendIcon /> <FormattedMessage id='app.supplementaryFilesTable.addFiles' defaultMessage='Save supplementary files' />
          </Button>
        </p>
      )}

      <ResourceRenderer
        resource={supplementaryFiles.toArray()} >
        {(...supplementaryFiles) => (
          <div>
            {supplementaryFiles.length > 0 && (
              <Table responsive>
                <thead>
                  <tr>
                    <th><FormattedMessage id='app.supplementaryFilesTable.fileName' defaultMessage='Original filename' /></th>
                    <th><FormattedMessage id='app.supplementaryFilesTable.fileHashName' defaultMessage='Hash Name' /></th>
                    <th><FormattedMessage id='app.supplementaryFilesTable.fileSize' defaultMessage='Filesize' /></th>
                    <th><FormattedMessage id='app.supplementaryFilesTable.fileUploadedAt' defaultMessage='Uploaded at' /></th>
                  </tr>
                </thead>
                <tbody>
                  {supplementaryFiles
                    .sort((a, b) => b.uploadedAt - a.uploadedAt) // sort from the newest to the oldest
                    .map((data, i) => <SupplementaryFilesTableRow {...data} key={data.id} />)}
                </tbody>
              </Table>
            )}
            {supplementaryFiles.length === 0 && (
              <p className='text-center'>
                <Icon name='folder-open-o' /> <FormattedMessage id='app.supplementaryFilesTable.empty' defaultMessage='There are no supplementary files attached to this exercise yet.' />
              </p>
            )}
          </div>
        )}
      </ResourceRenderer>
    </div>
  </Box>
);

SupplementaryFilesTable.propTypes = {
  uploadId: PropTypes.string.isRequired,
  supplementaryFiles: ImmutablePropTypes.map,
  canSubmit: PropTypes.bool,
  newFiles: ImmutablePropTypes.list,
  addSupplementaryFiles: PropTypes.func
};

export default SupplementaryFilesTable;
