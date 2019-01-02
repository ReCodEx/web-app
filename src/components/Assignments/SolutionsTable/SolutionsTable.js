import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';

import Box from '../../widgets/Box';
import NoSolutionYetTableRow from './NoSolutionYetTableRow';
import SolutionsTableRow from './SolutionsTableRow';

import styles from './SolutionsTable.less';

const SolutionsTable = ({
  title,
  assignmentId,
  solutions,
  runtimeEnvironments,
  noteMaxlen = null,
  compact = false
}) =>
  <Box title={title} collapsable isOpen noPadding unlimitedHeight>
    <Table responsive className={styles.solutionsTable}>
      <thead>
        <tr>
          <th />
          <th>
            <FormattedMessage
              id="app.solutionsTable.submissionDate"
              defaultMessage="Date of submission"
            />
          </th>
          <th className="text-center">
            <FormattedMessage
              id="app.solutionsTable.solutionValidity"
              defaultMessage="Validity"
            />
          </th>
          <th className="text-center">
            <FormattedMessage
              id="app.solutionsTable.receivedPoints"
              defaultMessage="Points"
            />
          </th>
          <th className="text-center">
            <FormattedMessage
              id="app.solutionsTable.environment"
              defaultMessage="Target language"
            />
          </th>
          {!compact &&
            <th>
              <FormattedMessage
                id="app.solutionsTable.note"
                defaultMessage="Note"
              />
            </th>}
          <th />
        </tr>
      </thead>
      {solutions.size === 0
        ? <NoSolutionYetTableRow />
        : solutions.map(data => {
            const id = data.id;
            const runtimeEnvironment =
              data.runtimeEnvironmentId &&
              runtimeEnvironments &&
              runtimeEnvironments.find(
                ({ id }) => id === data.runtimeEnvironmentId
              );

            return (
              <SolutionsTableRow
                key={id}
                id={id}
                status={
                  data.lastSubmission
                    ? data.lastSubmission.evaluationStatus
                    : null
                }
                runtimeEnvironment={runtimeEnvironment}
                assignmentId={assignmentId}
                noteMaxlen={noteMaxlen}
                compact={compact}
                {...data}
              />
            );
          })}
    </Table>
  </Box>;

SolutionsTable.propTypes = {
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ type: PropTypes.oneOf([FormattedMessage]) }),
    PropTypes.element
  ]).isRequired,
  assignmentId: PropTypes.string.isRequired,
  solutions: ImmutablePropTypes.list.isRequired,
  runtimeEnvironments: PropTypes.array,
  noteMaxlen: PropTypes.number,
  compact: PropTypes.bool
};

export default SolutionsTable;
