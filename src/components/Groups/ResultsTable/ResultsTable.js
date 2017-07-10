import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';

import ResultsTableRow from './ResultsTableRow';
import withLinks from '../../../hoc/withLinks';

const ResultsTable = ({
  assignments = List(),
  users = [],
  submissions,
  links: { SUPERVISOR_STATS_URI_FACTORY }
}) => {
  const assignmentsArray = assignments.sort(
    (a, b) => a.firstDeadline - b.firstDeadline
  );
  const assignmentsIds = assignmentsArray.map(assignment => assignment.id);
  return (
    <Table hover>
      <thead key={'head'}>
        <tr>
          <th />
          {assignmentsArray.map(assignment =>
            <th key={assignment.id}>
              <Link to={SUPERVISOR_STATS_URI_FACTORY(assignment.id)}>
                {assignment.name}
              </Link>
            </th>
          )}
        </tr>
      </thead>
      <tbody key={'body'}>
        {users.map(user =>
          <ResultsTableRow
            key={user.id}
            userId={user.id}
            assignmentsIds={assignmentsIds}
            submissions={submissions}
          />
        )}
      </tbody>
    </Table>
  );
};

ResultsTable.propTypes = {
  assignments: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  submissions: PropTypes.object.isRequired,
  links: PropTypes.object
};

export default withLinks(ResultsTable);
