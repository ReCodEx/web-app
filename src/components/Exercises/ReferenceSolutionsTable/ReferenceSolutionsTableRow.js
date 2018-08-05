import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, FormattedDate, FormattedTime } from 'react-intl';

import EnvironmentsListItem from '../../helpers/EnvironmentsList/EnvironmentsListItem';
import Icon from '../../icons';
import UsersNameContainer from '../../../containers/UsersNameContainer';

const ReferenceSolutionsTableRow = ({
  id,
  description,
  runtimeEnvironmentId,
  permissionHints = null,
  solution: { userId, createdAt },
  runtimeEnvironments,
  renderButtons
}) => {
  const rte = runtimeEnvironments.find(e => e.id === runtimeEnvironmentId);

  return (
    <tbody>
      <tr>
        <td rowSpan={2} className="valign-middle text-muted">
          <Icon icon="book" size="lg" gapLeft gapRight />
        </td>
        <td colSpan={3}>
          {description ||
            <i className="text-muted small">
              <FormattedMessage
                id="app.referenceSolutionTable.noDescription"
                defaultMessage="no desrciption given"
              />
            </i>}
        </td>
        <td className="text-right valign-middle" rowSpan={2}>
          {renderButtons(id, permissionHints)}
        </td>
      </tr>
      <tr>
        <td className="text-nowrap">
          <FormattedDate value={new Date(createdAt * 1000)} /> &nbsp;{' '}
          <FormattedTime value={new Date(createdAt * 1000)} />
        </td>
        <td className="text-nowrap">
          {rte
            ? <EnvironmentsListItem runtimeEnvironment={rte} longNames />
            : '-'}
        </td>
        <td className="text-nowrap">
          <UsersNameContainer userId={userId} isSimple />
        </td>
      </tr>
    </tbody>
  );
};

ReferenceSolutionsTableRow.propTypes = {
  id: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  runtimeEnvironmentId: PropTypes.string.isRequired,
  solution: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    createdAt: PropTypes.number.isRequired
  }),
  runtimeEnvironments: PropTypes.array.isRequired,
  permissionHints: PropTypes.object,
  renderButtons: PropTypes.func.isRequired
};

export default ReferenceSolutionsTableRow;
