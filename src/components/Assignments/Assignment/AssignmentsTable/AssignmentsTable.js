import React, { PropTypes } from 'react';
import { List } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import { isReady, isLoading, getJsData } from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, { NoAssignmentTableRow, LoadingAssignmentTableRow } from '../AssignmentTableRow';

const AssignmentsTable = ({
  assignments = List(),
  statuses = [],
  showGroup = true,
  userId = null
}) => (
  <Table hover>
    <thead>
      <tr>
        <th></th>
        <th><FormattedMessage id='app.assignments.name' defaultMessage='Assignment name' /></th>
        {showGroup && <th><FormattedMessage id='app.assignments.group' defaultMessage='Group' /></th>}
        <th><FormattedMessage id='app.assignments.deadline' defaultMessage='Deadline' /></th>
        <th><FormattedMessage id='app.assignments.secondDeadline' defaultMessage='Second deadline' /></th>
      </tr>
    </thead>
    <tbody>
      {assignments.size === 0 &&
        <NoAssignmentTableRow />}

      {assignments.some(isLoading) &&
        <LoadingAssignmentTableRow />}

      {assignments.filter(isReady)
        .map(getJsData)
        .map((assignment) => (
          <AssignmentTableRow
            key={assignment.id}
            item={assignment}
            userId={userId}
            showGroup={showGroup}
            status={statuses[assignment.id]} />
        ))}
    </tbody>
  </Table>
);

AssignmentsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  showGroup: PropTypes.bool,
  statuses: PropTypes.oneOfType([ PropTypes.object, PropTypes.array ]),
  userId: PropTypes.string
};

export default AssignmentsTable;
