import React, { PropTypes } from 'react';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import Icon from 'react-fontawesome';

import { isReady, isLoading, hasFailed, getJsData } from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, { NoAssignmentTableRow, LoadingAssignmentTableRow } from '../AssignmentTableRow';

const AssignmentsTable = ({
  assignments = [],
  statuses = {},
  showGroup = true
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
      {assignments.filter(isLoading).size === 0 && assignments.size === 0 &&
        <NoAssignmentTableRow />}

      {assignments.filter(isReady).map(getJsData).map(assignment =>
        <AssignmentTableRow
          key={assignment.id}
          item={assignment}
          showGroup={showGroup}
          status={statuses[assignment.id]} />)}

      {assignments.some(isLoading) &&
        <LoadingAssignmentTableRow />}
    </tbody>
  </Table>
);

AssignmentsTable.propTypes = {
  assignments: PropTypes.instanceOf(List).isRequired,
  showGroup: PropTypes.bool
};

export default AssignmentsTable;
