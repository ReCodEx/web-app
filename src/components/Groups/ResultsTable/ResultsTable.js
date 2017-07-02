import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';

import ResultsTableRow from './ResultsTableRow';
import LoadingResultsTableRow from './LoadingResultsTableRow';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import withLinks from '../../../hoc/withLinks';

const ResultsTable = ({
  assignments = List(),
  users = [],
  getPoints,
  links: { SUPERVISOR_STATS_URI_FACTORY }
}) => (
  <ResourceRenderer
    resource={assignments.toArray()}
    loading={
      <Table>
        <tbody>
          <LoadingResultsTableRow />
        </tbody>
      </Table>
    }
  >
    {(...assignments) => {
      const assignmentsArray = assignments.sort(
        (a, b) => a.firstDeadline - b.firstDeadline
      );
      const assignmentsIds = assignmentsArray.map(assignment => assignment.id);
      return (
        <Table hover>
          <thead key={'head'}>
            <tr>
              <th />
              {assignmentsArray.map(assignment => (
                <th key={assignment.id}>
                  <Link to={SUPERVISOR_STATS_URI_FACTORY(assignment.id)}>
                    {assignment.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody key={'body'}>
            {users.map(user => (
              <ResultsTableRow
                key={user.id}
                userId={user.id}
                assignmentsIds={assignmentsIds}
                getPoints={getPoints}
              />
            ))}
          </tbody>
        </Table>
      );
    }}
  </ResourceRenderer>
);

ResultsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  users: PropTypes.array.isRequired,
  getPoints: PropTypes.func.isRequired,
  links: PropTypes.object
};

export default withLinks(ResultsTable);
