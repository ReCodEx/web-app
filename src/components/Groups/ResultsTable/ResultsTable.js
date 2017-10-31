import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router';
import { FormattedMessage, injectIntl } from 'react-intl';

import ResultsTableRow from './ResultsTableRow';
import LoadingResultsTableRow from './LoadingResultsTableRow';
import NoResultsAvailableRow from './NoResultsAvailableRow';
import withLinks from '../../../hoc/withLinks';
import { getLocalizedName } from '../../../helpers/getLocalizedData';
import ResourceRenderer from '../../helpers/ResourceRenderer';
import styles from './ResultsTable.less';

const ResultsTable = ({
  assignments = List(),
  users = [],
  submissions,
  intl: { locale },
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
                    {getLocalizedName(assignment, locale)}
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
            <ResourceRenderer
              key={user.id}
              resource={Object.keys(submissions[user.id]).map(
                key => submissions[user.id][key]
              )}
              loading={<LoadingResultsTableRow />}
            >
              {(...userSubmissions) =>
                <ResultsTableRow
                  key={user.id}
                  userId={user.id}
                  assignmentsIds={assignmentsIds}
                  submissions={userSubmissions}
                />}
            </ResourceRenderer>
          )}
      </tbody>
    </Table>
  );
};

ResultsTable.propTypes = {
  assignments: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  submissions: PropTypes.object.isRequired,
  links: PropTypes.object,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(withLinks(ResultsTable));
