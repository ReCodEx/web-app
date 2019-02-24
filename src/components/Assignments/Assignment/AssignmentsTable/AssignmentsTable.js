import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { EMPTY_LIST, EMPTY_OBJ, EMPTY_ARRAY } from '../../../../helpers/common';

import { isReady, isLoading, getJsData } from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, { NoAssignmentTableRow, LoadingAssignmentTableRow } from '../AssignmentTableRow';
import { compareAssignmentsReverted } from '../../../helpers/assignments';

const fetchAssignmentStatus = (statuses, assignmentId) => {
  const assignStatus =
    statuses && Array.isArray(statuses) ? statuses.find(assignStatus => assignStatus.id === assignmentId) : null;
  return assignStatus ? assignStatus.status : '';
};

const AssignmentsTable = ({
  assignments = EMPTY_LIST,
  assignmentEnvironmentsSelector = null,
  statuses = EMPTY_ARRAY,
  userId = null,
  stats = EMPTY_OBJ,
  isAdmin = false,
  showNames = true,
  showGroups = false,
  groupsAccessor = null,
  intl: { locale },
}) => (
  <Table hover>
    {assignments.size > 0 && (
      <thead>
        <tr>
          <th className="shrink-col" />

          {showNames && (
            <th>
              <FormattedMessage id="app.assignments.name" defaultMessage="Assignment name" />
            </th>
          )}

          {showGroups && groupsAccessor && (
            <th>
              <FormattedMessage id="app.assignments.group" defaultMessage="Assigned in group" />
            </th>
          )}

          {assignmentEnvironmentsSelector && (
            <th>
              <FormattedMessage id="generic.runtimesShort" defaultMessage="Runtimes/Languages" />
            </th>
          )}

          {!isAdmin && Object.keys(stats).length !== 0 && (
            <th className="text-center text-nowrap">
              <FormattedMessage id="app.assignments.points" defaultMessage="Points" />
            </th>
          )}

          <th className="text-nowrap shrink-col">
            <FormattedMessage id="app.assignments.deadline" defaultMessage="Deadline" />
          </th>

          <th className="text-nowrap shrink-col">
            <FormattedMessage id="app.assignments.maxPointsShort" defaultMessage="Max. points" />
          </th>

          <th className="text-nowrap shrink-col">
            <FormattedMessage id="app.assignments.secondDeadline" defaultMessage="Second deadline" />
          </th>

          <th className="text-nowrap shrink-col">
            <FormattedMessage id="app.assignments.maxPointsShort" defaultMessage="Max. points" />
          </th>

          {isAdmin && <th />}
        </tr>
      </thead>
    )}
    <tbody>
      {assignments.size === 0 && <NoAssignmentTableRow />}

      {assignments.some(isLoading) && (
        <LoadingAssignmentTableRow colSpan={5 + (assignmentEnvironmentsSelector ? 1 : 0)} />
      )}

      {assignments
        .filter(isReady)
        .map(getJsData)
        .sort(compareAssignmentsReverted)
        .map(assignment => (
          <AssignmentTableRow
            key={assignment.id}
            item={assignment}
            runtimeEnvironments={assignmentEnvironmentsSelector && assignmentEnvironmentsSelector(assignment.id)}
            userId={userId}
            status={fetchAssignmentStatus(statuses, assignment.id)}
            locale={locale}
            stats={Object.keys(stats).length !== 0 ? stats.assignments.find(item => item.id === assignment.id) : null}
            isAdmin={isAdmin}
            showNames={showNames}
            showGroups={showGroups}
            groupsAccessor={groupsAccessor}
          />
        ))}
    </tbody>
  </Table>
);

AssignmentsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  assignmentEnvironmentsSelector: PropTypes.func,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  showNames: PropTypes.bool,
  showGroups: PropTypes.bool,
  groupsAccessor: PropTypes.func,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
};

export default injectIntl(AssignmentsTable);
