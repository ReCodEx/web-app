import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

import ResultsTableRow from './ResultsTableRow';
import NoResultsAvailableRow from './NoResultsAvailableRow';
import withLinks from '../../../hoc/withLinks';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import styles from './ResultsTable.less';

const ResultsTable = ({
  assignments = List(),
  users = [],
  stats,
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
              <div className={styles.verticalText}>
                <div className={styles.verticalTextInner}>
                  <Link to={SUPERVISOR_STATS_URI_FACTORY(assignment.id)}>
                    <LocalizedExerciseName entity={assignment} />
                  </Link>
                </div>
              </div>
            </th>
          )}
          <th style={{ textAlign: 'right' }}>
            <FormattedMessage
              id="app.resultsTable.total"
              defaultMessage="Total"
            />
          </th>
        </tr>
      </thead>
      <tbody key={'body'}>
        {(users.length === 0 || assignments.length === 0) &&
          <NoResultsAvailableRow />}
        {users.length !== 0 &&
          assignments.length !== 0 &&
          users.map(user =>
            <ResultsTableRow
              key={user.id}
              userId={user.id}
              assignmentsIds={assignmentsIds}
              userStats={stats.find(stat => stat.userId === user.id)}
            />
          )}
      </tbody>
    </Table>
  );
};

ResultsTable.propTypes = {
  assignments: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  stats: PropTypes.array.isRequired,
  links: PropTypes.object
};

export default withLinks(ResultsTable);
