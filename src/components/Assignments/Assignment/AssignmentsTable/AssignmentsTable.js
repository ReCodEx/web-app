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

const displayPoints = (bestSubmissions, assignments) => {
  const assignmentIds = assignments
    .filter(isReady)
    .map(getJsData)
    .map(assignment => assignment.id);
  return Object.keys(bestSubmissions)
    .filter(key => assignmentIds.indexOf(key) >= 0)
    .reduce((acc, key) => {
      acc = acc || bestSubmissions[key];
      return acc;
    }, false);
};

const AssignmentsTable = ({
  assignments = List(),
  statuses = [],
  showGroup = true,
  userId = null,
  bestSubmissions = {},
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
          displayPoints(bestSubmissions, assignments) &&
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
            status={
              Array.isArray(statuses)
                ? statuses.find(
                    assignStatus => assignStatus.id === assignment.id
                  ).status
                : ''
            }
            locale={locale}
            bestSubmission={bestSubmissions[assignment.id]}
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
  bestSubmissions: PropTypes.object,
  isAdmin: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(AssignmentsTable);
