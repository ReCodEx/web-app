import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';
import { Table, Label } from 'react-bootstrap';
import Icon from 'react-fontawesome';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const getRuntimeName = (runtimes, id) => {
  const runtime = runtimes.find(r => r.id === id);
  return runtime ? runtime.name : id;
};

const ReferenceSolutionsList = ({
  referenceSolutions = [],
  runtimeEnvironments,
  renderButtons = () => null,
  ...props
}) =>
  <Table hover {...props}>
    <thead>
      <tr>
        <th />
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
            id="generic.runtimeShort"
            defaultMessage="Runtime/Language"
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
              <td className="text-center">
                <Icon name="file-code-o" />
              </td>
              <td>
                {description}
              </td>
              <td className="text-nowrap">
                <FormattedDate value={new Date(createdAt * 1000)} /> &nbsp;{' '}
                <FormattedTime value={new Date(createdAt * 1000)} />
              </td>
              <td className="text-nowrap">
                <Label>
                  {getRuntimeName(runtimeEnvironments, runtimeEnvironmentId)}
                </Label>
              </td>
              <td className="text-nowrap">
                <UsersNameContainer userId={userId} />
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
