import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { Map, List } from 'immutable'

import { Table } from 'react-bootstrap';
import Box from '../../AdminLTE/Box';

import ResourceRenderer from '../../ResourceRenderer';
import SupplementaryFilesTableRow from './SupplementaryFilesTableRow';

const SupplementaryFilesTable = ({
  supplementaryFiles
}) => (
  <Box title={<FormattedMessage id='app.supplementaryFilesTable.title' defaultMessage='Supplementary Files' />} collapsable isOpen noPadding>
    <div>
      <p>
        <FormattedMessage id='app.supplementaryFilesTable.description' defaultMessage='Supplementary files are files which can be used in job configuration.' />
      </p>
      <Table responsive>
        <thead>
          <tr>
            <th><FormattedMessage id='app.supplementaryFilesTable.fileName' defaultMessage='Original filename' /></th>
            <th><FormattedMessage id='app.supplementaryFilesTable.fileHashName' defaultMessage='Hash Name' /></th>
            <th><FormattedMessage id='app.supplementaryFilesTable.fileSize' defaultMessage='Filesize' /></th>
            <th><FormattedMessage id='app.supplementaryFilesTable.fileUploadedAt' defaultMessage='Uploaded at' /></th>
          </tr>
        </thead>
          <ResourceRenderer
            resource={supplementaryFiles.toArray()} >
            {(...supplementaryFiles) => (
              <tbody>
                {supplementaryFiles.map((data, i) => <SupplementaryFilesTableRow {...data} key={data.id} />)}
              </tbody>
            )}
          </ResourceRenderer>
      </Table>
    </div>
  </Box>
);

SupplementaryFilesTable.propTypes = {
  supplementaryFiles: PropTypes.instanceOf(Map)
};

export default SupplementaryFilesTable;
