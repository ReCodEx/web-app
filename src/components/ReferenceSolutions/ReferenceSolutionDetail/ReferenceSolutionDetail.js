import React from 'react';
import PropTypes from 'prop-types';
import Icon from 'react-fontawesome';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';

const ReferenceSolutionDetail = ({
  description,
  solution: { userId, createdAt },
  exerciseId
}) =>
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
            <Icon name="code" />
          </td>
          <th>
            <FormattedMessage
              id="app.referenceSolutionDetail.exercise"
              defaultMessage="Exercise"
            />
          </th>
          <td>
            {exerciseId && <ExercisesNameContainer exerciseId={exerciseId} />}
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <Icon name="pencil" />
          </td>
          <th>
            <FormattedMessage
              id="generic.description"
              defaultMessage="Description"
            />:
          </th>
          <td>
            {description}
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <Icon name="clock-o" />
          </td>
          <th>
            <FormattedMessage
              id="generic.uploadedAt"
              defaultMessage="Uploaded at"
            />:
          </th>
          <td>
            <FormattedDate value={createdAt * 1000} />
            &nbsp;
            <FormattedTime value={createdAt * 1000} />
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <Icon name="user" />
          </td>
          <th>
            <FormattedMessage id="generic.author" defaultMessage="Author" />:
          </th>
          <td>
            <UsersNameContainer userId={userId} />
          </td>
        </tr>
      </tbody>
    </Table>
  </Box>;

ReferenceSolutionDetail.propTypes = {
  description: PropTypes.string.isRequired,
  solution: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    createdAt: PropTypes.number.isRequired
  }).isRequired,
  exerciseId: PropTypes.string.isRequired
};

export default ReferenceSolutionDetail;
