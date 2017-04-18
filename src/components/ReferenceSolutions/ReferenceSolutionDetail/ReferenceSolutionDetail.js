import React, { PropTypes } from 'react';
import Icon from 'react-fontawesome';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../AdminLTE/Box';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const ReferenceSolutionDetail = (
  {
    description,
    uploadedAt,
    solution: {
      userId
    }
  }
) => (
  <Box
    title={
      <FormattedMessage
        id="app.referenceSolutionDetail.title.details"
        defaultMessage="Reference solution detail"
      />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}
  >
    <Table>
      <tbody>
        <tr>
          <td className="text-center">
            <Icon name="pencil" />
          </td>
          <th>
            <FormattedMessage
              id="app.referenceSolutionDetail.description"
              defaultMessage="Description"
            />
          </th>
          <td>{description}</td>
        </tr>
        <tr>
          <td className="text-center">
            <Icon name="clock-o" />
          </td>
          <th>
            <FormattedMessage
              id="app.referenceSolutionDetail.uploadedAt"
              defaultMessage="Uploaded at:"
            />
          </th>
          <td>
            <FormattedDate value={uploadedAt * 1000} />
            &nbsp;
            <FormattedTime value={uploadedAt * 1000} />
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <Icon name="user" />
          </td>
          <th>
            <FormattedMessage
              id="app.referenceSolution.author"
              defaultMessage="Author:"
            />
          </th>
          <td>
            <UsersNameContainer userId={userId} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>
);

ReferenceSolutionDetail.propTypes = {
  description: PropTypes.string.isRequired,
  uploadedAt: PropTypes.number.isRequired,
  solution: PropTypes.shape({
    userId: PropTypes.string.isRequired
  }).isRequired
};

export default ReferenceSolutionDetail;
