import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';

import ResultsTableRow from './ResultsTableRow';
import LoadingResultsTableRow from './LoadingResultsTableRow';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const ResultsTable = ({ assignments = List(), users = List(), getPoints }) => (
  <Table hover>
    <ResourceRenderer
      resource={[assignments.toArray(), users.toArray()]}
      loading={
        <tbody>
          <LoadingResultsTableRow />
        </tbody>
      }
    >
      {(assignments, users) => {
        const assignmentsArray = assignments.sort(
          (a, b) => a.firstDeadline - b.firstDeadline
        );
        return [
          <thead key={'head'}>
            <tr>
              <td>
                <FormattedMessage
                  id="app.groupResultsTable.user"
                  defaultMessage="User"
                />
              </td>
              {assignmentsArray.map(assignment => (
                <th key={assignment.id}>{assignment.name}</th>
              ))}
            </tr>
          </thead>,
          <tbody key={'body'}>
            {users.map(user => (
              <ResultsTableRow
                key={user.id}
                user={user}
                assignmentIds={assignmentsArray.map(
                  assignment => assignment.id
                )}
                getPoints={getPoints}
              />
            ))}
          </tbody>
        ];
      }}
    </ResourceRenderer>
  </Table>
);

ResultsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  users: ImmutablePropTypes.list.isRequired,
  getPoints: PropTypes.func.isRequired
};

export default ResultsTable;
