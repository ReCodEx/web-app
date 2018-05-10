import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';
import { defaultMemoize } from 'reselect';

import { safeGet, EMPTY_ARRAY } from '../../../helpers/common';
import UsersNameContainer from '../../../containers/UsersNameContainer';
import SortableTable from '../../widgets/SortableTable';
import withLinks from '../../../helpers/withLinks';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { compareAssignments } from '../../helpers/compareAssignments';
import styles from './ResultsTable.less';

// Functors for rendering cells of individual columns.
const cellRenderers = {
  // default renderer is used for all assignment points
  '': points =>
    points && Number.isInteger(points.gained)
      ? <span>
          {points.gained}
          {points.bonus > 0 &&
            <span className={styles.bonusPoints}>
              +{points.bonus}
            </span>}
          {points.bonus < 0 &&
            <span className={styles.malusPoints}>
              {points.bonus}
            </span>}
        </span>
      : '-',
  user: user => user && <UsersNameContainer userId={user.id} />,
  total: points =>
    <strong>
      {points ? `${points.gained}/${points.total}` : '-/-'}
    </strong>,
  buttons: btns => btns // identity for buttons prevents using default (points) renderer
};

// Per-col styling for the table
const tableStyles = {
  '': { className: 'text-center' },
  user: { className: 'text-left' },
  buttons: { className: 'text-right' }
};

// Create comparators object based on given locale ...
const prepareTableComparators = defaultMemoize(locale => {
  const nameComparator = (u1, u2) =>
    u1.name.lastName.localeCompare(u2.name.lastName, locale) ||
    u1.name.firstName.localeCompare(u2.name.firstName, locale) ||
    u1.privateData.email.localeCompare(u2.privateData.email, locale);
  return {
    user: ({ user: u1 }, { user: u2 }) => nameComparator(u1, u2),
    total: ({ total: t1, user: u1 }, { total: t2, user: u2 }) =>
      (Number(t2 && t2.gained) || -1) - (Number(t1 && t1.gained) || -1) ||
      nameComparator(u1, u2)
  };
});

class ResultsTable extends Component {
  // Prepare header descriptor object for SortableTable.
  prepareHeader = defaultMemoize(assignments => {
    const {
      isAdmin,
      isSupervisor,
      links: { ASSIGNMENT_STATS_URI_FACTORY, ASSIGNMENT_DETAIL_URI_FACTORY }
    } = this.props;
    const header = {
      user: <FormattedMessage id="generic.name" defaultMessage="Name" />
    };

    assignments.sort(compareAssignments).forEach(
      assignment =>
        (header[`${assignment.id}`] = (
          <div className={styles.verticalText}>
            <div className={styles.verticalTextInner}>
              <Link
                to={
                  isAdmin || isSupervisor
                    ? ASSIGNMENT_STATS_URI_FACTORY(assignment.id)
                    : ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id)
                }
              >
                <LocalizedExerciseName entity={assignment} />
              </Link>
            </div>
          </div>
        ))
    );

    header.total = (
      <FormattedMessage id="app.resultsTable.total" defaultMessage="Total" />
    );

    if (isAdmin) {
      header.buttons = '';
    }
    return header;
  });

  // Re-format the data, so they can be rendered by the SortableTable ...
  prepareData = defaultMemoize((assignments, users, stats) => {
    const {
      isAdmin,
      isSupervisor,
      loggedUser,
      publicStats,
      renderActions
    } = this.props;

    if (!isAdmin && !isSupervisor && !publicStats) {
      users = users.filter(({ id }) => id === loggedUser);
    }

    return users.map(user => {
      const userStats = stats.find(stat => stat.userId === user.id);
      const data = {
        id: user.id,
        user: user,
        total: userStats && userStats.points,
        buttons: renderActions && isAdmin ? renderActions(user.id) : ''
      };
      assignments.forEach(assignment => {
        const assignmentStats = safeGet(userStats, [
          'assignments',
          a => a.id === assignment.id,
          'points'
        ]);
        data[assignment.id] = assignmentStats || {};
      });
      return data;
    });
  });

  render() {
    const {
      assignments = EMPTY_ARRAY,
      users = EMPTY_ARRAY,
      stats,
      intl: { locale }
    } = this.props;
    return (
      <SortableTable
        hover
        header={this.prepareHeader(assignments)}
        comparators={prepareTableComparators(locale)}
        defaultOrder="user"
        styles={tableStyles}
        cellRenderers={cellRenderers}
        data={this.prepareData(assignments, users, stats)}
        empty={
          <div className="text-center text-muted">
            <FormattedMessage
              id="app.groupResultsTableRow.noStudents"
              defaultMessage="There are currently no students in the group."
            />
          </div>
        }
      />
    );
  }
}

ResultsTable.propTypes = {
  assignments: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  loggedUser: PropTypes.string,
  stats: PropTypes.array.isRequired,
  publicStats: PropTypes.bool,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  renderActions: PropTypes.func,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
  links: PropTypes.object
};

export default withLinks(injectIntl(ResultsTable));
