import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import AssignmentNameContainer from '../../../containers/AssignmentNameContainer';
import DateTime from '../../widgets/DateTime';
import Button from '../../widgets/TheButton';
import { DeleteIcon } from '../../icons';
import { getRecentlyVisitedSolutions, clearRecentlyVisitedSolutions } from './functions.js';

const RecentlyVisited = ({ selectedId, secondSelectedId = null, onSelect = null }) => {
  const [renderTrigger, setRenderTrigger] = useState(0);
  const visited = getRecentlyVisitedSolutions();

  return visited.length > 1 ? (
    <>
      <Table hover className="border-bottom mb-3">
        <thead>
          <tr>
            <th>
              <FormattedMessage id="generic.author" defaultMessage="Author" />
            </th>
            <th>
              <FormattedMessage id="app.solutionsTable.assignment" defaultMessage="Assignment" />
            </th>
            <th>
              <FormattedMessage id="generic.attempt" defaultMessage="Attempt" />
            </th>
            <th>
              <FormattedMessage id="app.solution.submittedAt" defaultMessage="Submitted at" />
            </th>
          </tr>
        </thead>
        <tbody>
          {visited.map(({ id, authorId, assignmentId, createdAt, attemptIndex }) => (
            <tr
              key={id}
              onClick={
                onSelect && id !== selectedId && id !== secondSelectedId
                  ? ev => {
                      ev.preventDefault();
                      onSelect(id);
                    }
                  : null
              }
              className={
                id === selectedId
                  ? 'table-primary text-body-secondary'
                  : id === secondSelectedId
                    ? 'table-warning text-body-secondary'
                    : 'clickable'
              }>
              <td>
                <UsersNameContainer userId={authorId} showEmail="icon" />
              </td>
              <td>
                <AssignmentNameContainer assignmentId={assignmentId} noLink />
              </td>
              <td>#{attemptIndex}</td>
              <td>
                <DateTime unixTs={createdAt} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <div className="text-center">
        <Button
          variant="danger"
          onClick={() => {
            clearRecentlyVisitedSolutions();
            setRenderTrigger(renderTrigger + 1);
          }}>
          <DeleteIcon gapRight={2} />
          <FormattedMessage id="app.solutions.recentlyVisited.clearCache" defaultMessage="Clear the cache" />
        </Button>
      </div>
    </>
  ) : (
    <div className="text-body-secondary text-center p-4">
      <FormattedMessage
        id="app.solutions.recentlyVisited.noRecentlyVisited"
        defaultMessage="There are no other solutions recorded as recently visited. Try finding and opening the solution that you wish to compare with this one and then refreshing this page."
      />
    </div>
  );
};

RecentlyVisited.propTypes = {
  selectedId: PropTypes.string.isRequired,
  secondSelectedId: PropTypes.string,
  onSelect: PropTypes.func,
};

export default RecentlyVisited;
