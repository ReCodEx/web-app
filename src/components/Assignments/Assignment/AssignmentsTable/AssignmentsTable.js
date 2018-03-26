import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';

import {
  isReady,
  isLoading,
  getJsData
} from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, {
  NoAssignmentTableRow,
  LoadingAssignmentTableRow
} from '../AssignmentTableRow';
import { compareAssignments } from '../../../helpers/compareAssignments';

const fetchAssignmentStatus = (statuses, assignmentId) => {
  const assignStatus =
    statuses && Array.isArray(statuses)
      ? statuses.find(assignStatus => assignStatus.id === assignmentId)
      : null;
  return assignStatus ? assignStatus.status : '';
};

const AssignmentsTable = ({
  assignments = List(),
  statuses = [],
  showGroup = true,
  userId = null,
  stats = {},
  isAdmin = false,
  intl: { locale }
}) =>
  <Table hover>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage
            id="app.assignments.name"
            defaultMessage="Assignment name"
          />
        </th>
        {showGroup &&
          <th>
            <FormattedMessage
              id="app.assignments.group"
              defaultMessage="Group"
            />
          </th>}
        {!isAdmin &&
          Object.keys(stats).length !== 0 &&
          <th>
            <FormattedMessage
              id="app.assignments.points"
              defaultMessage="Points"
            />
          </th>}
        <th>
          <FormattedMessage
            id="app.assignments.deadline"
            defaultMessage="Deadline"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.assignments.secondDeadline"
            defaultMessage="Second deadline"
          />
        </th>
        {isAdmin && <th />}
      </tr>
    </thead>
    <tbody>
      {assignments.size === 0 && <NoAssignmentTableRow />}

      {assignments.some(isLoading) && <LoadingAssignmentTableRow />}

      {assignments
        .filter(isReady)
        .map(getJsData)
        .sort(compareAssignments)
        .map(assignment =>
          <AssignmentTableRow
            key={assignment.id}
            item={assignment}
            userId={userId}
            showGroup={showGroup}
            status={fetchAssignmentStatus(statuses, assignment.id)}
            locale={locale}
            stats={
              Object.keys(stats).length !== 0
                ? stats.assignments.find(item => item.id === assignment.id)
                : null
            }
            isAdmin={isAdmin}
          />
        )}
    </tbody>
  </Table>;

AssignmentsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  showGroup: PropTypes.bool,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(AssignmentsTable);
