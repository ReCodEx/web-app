import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { Table } from 'react-bootstrap';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import EnvironmentsList from '../../helpers/EnvironmentsList';

const ReferenceSolutionsList = ({
  referenceSolutions = [],
  runtimeEnvironments,
  renderButtons = () => null,
  ...props
}) =>
  <Table hover {...props}>
    <thead>
      <tr>
        <th>
          <FormattedMessage
            id="generic.description"
            defaultMessage="Description"
          />
        </th>
        <th>
          <FormattedMessage
            id="generic.uploadedAt"
            defaultMessage="Uploaded at"
          />
        </th>
        <th>
          <FormattedMessage
            id="generic.runtimeShortest"
            defaultMessage="Runtime"
          />
        </th>
        <th>
          <FormattedMessage id="generic.author" defaultMessage="Author" />
        </th>
        <th />
      </tr>
    </thead>
    <tbody>
      {referenceSolutions
        .sort((a, b) => a.solution.createdAt - b.solution.createdAt)
        .map(
          ({
            id,
            description,
            runtimeEnvironmentId,
            permissionHints,
            solution: { userId, createdAt }
          }) =>
            <tr key={id}>
              <td>
                {description}
              </td>
              <td className="text-nowrap">
                <FormattedDate value={new Date(createdAt * 1000)} /> &nbsp;{' '}
                <FormattedTime value={new Date(createdAt * 1000)} />
              </td>
              <td className="text-nowrap">
                <EnvironmentsList
                  runtimeEnvironments={runtimeEnvironments.filter(
                    e => e.id === runtimeEnvironmentId
                  )}
                />
              </td>
              <td className="text-nowrap">
                <UsersNameContainer userId={userId} isSimple />
              </td>
              <td className="text-right text-nowrap">
                {renderButtons(id, permissionHints)}
              </td>
            </tr>
        )}
    </tbody>
  </Table>;

ReferenceSolutionsList.propTypes = {
  referenceSolutions: PropTypes.array.isRequired,
  runtimeEnvironments: PropTypes.array.isRequired,
  renderButtons: PropTypes.func
};

export default ReferenceSolutionsList;
