import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import NoSolutionYetTableRow from './NoSolutionYetTableRow';
import SolutionsTableRow from './SolutionsTableRow';
import { LoadingIcon } from '../../icons';

import styles from './SolutionsTable.less';

const SolutionsTable = ({
  assignmentId,
  groupId,
  solutions,
  runtimeEnvironments,
  noteMaxlen = null,
  compact = false,
  selected = null,
}) => (
  <Table responsive className={styles.solutionsTable}>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage id="app.solutionsTable.submissionDate" defaultMessage="Date of submission" />
        </th>
        <th className="text-center">
          <FormattedMessage id="app.solutionsTable.solutionValidity" defaultMessage="Validity" />
        </th>
        <th className="text-center">
          <FormattedMessage id="app.solutionsTable.receivedPoints" defaultMessage="Points" />
        </th>
        <th className="text-center">
          <FormattedMessage id="app.solutionsTable.environment" defaultMessage="Target language" />
        </th>
        {!compact && (
          <th>
            <FormattedMessage id="app.solutionsTable.note" defaultMessage="Note" />
          </th>
        )}
        <td className="text-right text-muted small">
          {solutions.size > 5 && (
            <FormattedMessage
              id="app.solutionsTable.rowsCount"
              defaultMessage="Total records: {count}"
              values={{ count: solutions.size }}
            />
          )}
        </td>
      </tr>
    </thead>
    {solutions.size === 0 ? (
      <NoSolutionYetTableRow />
    ) : (
      solutions.map((data, idx) => {
        if (!data) {
          return (
            <tbody key={idx}>
              <tr>
                <td colSpan={compact ? 6 : 7} className="text-center">
                  <LoadingIcon size="xs" />
                </td>
              </tr>
            </tbody>
          );
        }

        const id = data.id;
        const runtimeEnvironment =
          data.runtimeEnvironmentId &&
          runtimeEnvironments &&
          runtimeEnvironments.find(({ id }) => id === data.runtimeEnvironmentId);

        return (
          <SolutionsTableRow
            key={id}
            id={id}
            status={data.lastSubmission ? data.lastSubmission.evaluationStatus : null}
            runtimeEnvironment={runtimeEnvironment}
            assignmentId={assignmentId}
            groupId={groupId}
            noteMaxlen={noteMaxlen}
            compact={compact}
            selected={id === selected}
            {...data}
          />
        );
      })
    )}
  </Table>
);

SolutionsTable.propTypes = {
  assignmentId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  solutions: ImmutablePropTypes.list.isRequired,
  runtimeEnvironments: PropTypes.array,
  noteMaxlen: PropTypes.number,
  compact: PropTypes.bool,
  selected: PropTypes.string,
};

export default SolutionsTable;
