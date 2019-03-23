import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import DateTime from '../../widgets/DateTime';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import ExercisesNameContainer from '../../../containers/ExercisesNameContainer';
import Icon, { EditIcon, CodeIcon } from '../../icons';
import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';

const ReferenceSolutionStatus = ({ description, userId, submittedAt, submittedBy, exerciseId, environment }) => (
  <Box
    title={
      <FormattedMessage id="app.referenceSolutionDetail.title.details" defaultMessage="Reference Solution Detail" />
    }
    noPadding={true}
    collapsable={true}
    isOpen={true}>
    <Table>
      <tbody>
        <tr>
          <td className="text-center">
            <CodeIcon />
          </td>
          <th>
            <FormattedMessage id="app.referenceSolutionDetail.exercise" defaultMessage="Exercise" />:
          </th>
          <td>{exerciseId && <ExercisesNameContainer exerciseId={exerciseId} />}</td>
        </tr>

        <tr>
          <td className="text-center">
            <EditIcon />
          </td>
          <th>
            <FormattedMessage id="generic.description" defaultMessage="Description" />:
          </th>
          <td>{description}</td>
        </tr>

        <tr>
          <td className="text-center">
            <Icon icon={['far', 'clock']} />
          </td>
          <th>
            <FormattedMessage id="generic.uploadedAt" defaultMessage="Uploaded at" />:
          </th>
          <td>
            <DateTime unixts={submittedAt} showRelative />
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

        {Boolean(submittedBy) && submittedBy !== userId && (
          <tr>
            <td className="text-center">
              <Icon icon="user" />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.referenceSolution.reevaluatedBy" defaultMessage="Re-evaluated by" />:
            </th>
            <td>
              <UsersNameContainer userId={submittedBy} showEmail="icon" />
            </td>
          </tr>
        )}

        {Boolean(environment) && Boolean(environment.name) && (
          <tr>
            <td className="text-center">
              <CodeIcon />
            </td>
            <th className="text-nowrap">
              <FormattedMessage id="app.solution.environment" defaultMessage="Target language:" />
            </th>
            <td>
              <EnvironmentsListItem runtimeEnvironment={environment} longNames={true} />
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  </Box>
);

ReferenceSolutionStatus.propTypes = {
  description: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  submittedBy: PropTypes.string.isRequired,
  submittedAt: PropTypes.number.isRequired,
  exerciseId: PropTypes.string.isRequired,
  environment: PropTypes.object,
};

export default ReferenceSolutionStatus;
