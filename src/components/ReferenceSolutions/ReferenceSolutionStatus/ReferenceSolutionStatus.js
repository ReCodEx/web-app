import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';
import Icon, { EditIcon } from '../../icons';

const ReferenceSolutionStatus = ({
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
            <Icon icon="code" />
          </td>
          <th>
            <FormattedMessage
              id="app.referenceSolutionDetail.exercise"
              defaultMessage="Exercise"
            />:
          </th>
          <td>
            {exerciseId && <ExercisesNameContainer exerciseId={exerciseId} />}
          </td>
        </tr>
        <tr>
          <td className="text-center">
            <EditIcon />
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
            <Icon icon={['far', 'clock']} />
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
            <Icon icon="user" />
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

ReferenceSolutionStatus.propTypes = {
  description: PropTypes.string.isRequired,
  solution: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    createdAt: PropTypes.number.isRequired
  }).isRequired,
  exerciseId: PropTypes.string.isRequired
};

export default ReferenceSolutionStatus;
