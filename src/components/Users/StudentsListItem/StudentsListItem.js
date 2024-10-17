import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { ProgressBar } from 'react-bootstrap';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import withLinks from '../../../helpers/withLinks.js';

const StudentsListItem = ({
  id,
  groupId = null,
  stats,
  renderActions,
  links: { GROUP_USER_SOLUTIONS_URI_FACTORY },
}) => {
  const totalPoints = (stats && stats && (stats.points.total || stats.points.limit)) || 0;
  return (
    <tr>
      <td>
        <UsersNameContainer userId={id} link={groupId && GROUP_USER_SOLUTIONS_URI_FACTORY(groupId, id)} listItem />
      </td>
      <td className="valign-middle">
        {stats && (
          <ProgressBar
            className="progress-xs"
            now={totalPoints > 0 ? Math.min(1, stats.points.gained / totalPoints) * 100 : 0}
            variant={!stats.hasLimit ? 'info' : stats.passesLimit ? 'success' : 'danger'}
          />
        )}
      </td>
      <td className="text-nowrap shrink-col">
        {stats && (
          <>
            <FormattedMessage
              id="app.studentsList.gainedPointsOfWithoutBreakingSpaces"
              defaultMessage="{gained, number} of {total, number}"
              values={{ gained: stats.points.gained, total: totalPoints }}
            />
            {Boolean(stats.points.limit && stats.points.total && stats.points.limit !== stats.points.total) && (
              <small className="ml-2 text-muted">
                {' '}
                <FormattedMessage
                  id="app.studentsList.statsPointsLimit"
                  defaultMessage="(required {limit, number})"
                  values={{ limit: stats.points.limit }}
                />
              </small>
            )}
          </>
        )}
      </td>
      {renderActions && <td>{renderActions(id)}</td>}
    </tr>
  );
};

StudentsListItem.propTypes = {
  id: PropTypes.string.isRequired,
  groupId: PropTypes.string,
  stats: PropTypes.shape({
    points: PropTypes.shape({
      total: PropTypes.number.isRequired,
      limit: PropTypes.number,
      gained: PropTypes.number.isRequired,
    }),
    hasLimit: PropTypes.bool,
    passesLimit: PropTypes.bool,
  }),
  renderActions: PropTypes.func,
  links: PropTypes.object,
};

export default withLinks(StudentsListItem);
