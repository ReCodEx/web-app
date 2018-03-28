import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';

import ResultsTableRow from './ResultsTableRow';
import NoResultsAvailableRow from './NoResultsAvailableRow';
import withLinks from '../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { compareAssignments } from '../../helpers/compareAssignments';
import styles from './ResultsTable.less';
import UsersName from '../../Users/UsersName/UsersName';

const FirstResultsTableRow = ({
  userId,
  assignmentsIds,
  userStats,
  isAdmin,
  renderActions
}) => {
  return (
    <tr>
      <td>
        <UsersName
          id={'ester'}
          fullName={'Ester Ledecká'}
          avatarUrl={
            'https://www.pyeongchang2018.com/en/game-time/results/OWG2018/resOWG2018/img/bios/photos/3042090.jpg'
          }
          size={30}
          large={false}
          isVerified={true}
          noLink={true}
          currentUserId={''}
        />
      </td>
      {assignmentsIds.map(assignmentId => {
        let assignmentData = {};
        if (userStats && userStats.assignments) {
          const assignment = userStats.assignments.find(
            assignment => assignment.id === assignmentId
          );
          if (assignment !== undefined) {
            assignmentData = assignment;
          }
        }
        return (
          <td key={assignmentId}>
            {assignmentData.points &&
            Number.isInteger(assignmentData.points.total)
              ? assignmentData.points.total
              : '-'}
            <span style={{ color: 'green' }}>+0.01</span>
          </td>
        );
      })}
      <td style={{ textAlign: 'right' }}>
        <b>
          {'∞'}/{userStats && userStats.points ? userStats.points.total : '-'}
        </b>
      </td>
      {isAdmin && <td className="text-right" />}
    </tr>
  );
};

const ResultsTable = ({
  assignments = List(),
  users = [],
  stats,
  isAdmin = false,
  renderActions = null,
  links: { SUPERVISOR_STATS_URI_FACTORY }
}) => {
  const assignmentsArray = assignments.sort(compareAssignments);
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
          {isAdmin && <th />}
        </tr>
      </thead>
      <tbody key={'body'}>
        {(users.length === 0 || assignments.length === 0) &&
          <NoResultsAvailableRow />}
        {users.length !== 0 &&
          assignments.length !== 0 &&
          <FirstResultsTableRow
            key={'ester'}
            userId={users[0].id}
            assignmentsIds={assignmentsIds}
            userStats={stats.find(stat => stat.userId === users[0].id)}
            isAdmin={isAdmin}
            renderActions={renderActions}
          />}
        {users.length !== 0 &&
          assignments.length !== 0 &&
          users.map(user =>
            <ResultsTableRow
              key={user.id}
              userId={user.id}
              assignmentsIds={assignmentsIds}
              userStats={stats.find(stat => stat.userId === user.id)}
              isAdmin={isAdmin}
              renderActions={renderActions}
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
  isAdmin: PropTypes.bool,
  renderActions: PropTypes.func,
  links: PropTypes.object
};

export default withLinks(ResultsTable);
