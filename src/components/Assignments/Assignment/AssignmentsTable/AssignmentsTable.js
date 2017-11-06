import React from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';

import {
  isReady,
  isLoading,
  getJsData
} from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, {
  NoAssignmentTableRow,
  LoadingAssignmentTableRow
} from '../AssignmentTableRow';

const compareAssignments = (a, b) => {
  // first compare by deadline
  if (a.firstDeadline < b.firstDeadline) {
    return -1;
  } else if (a.firstDeadline === b.firstDeadline) {
    // then compare by second deadline - if one of them does not have any,
    // it is lower -> higher position in the table
    if (a.allowSecondDeadline !== b.allowSecondDeadline) {
      // one has the second deadline and the other not
      return a.allowSecondDeadline ? 1 : -1;
    } else {
      // if both have second deadline, compare them
      if (a.allowSecondDeadline === true) {
        if (a.secondDeadline < b.secondDeadline) {
          return -1;
        } else if (a.secondDeadline > b.secondDeadline) {
          return 1;
        }
        // if second deadlines are equal, continue
      }

      // none of them have second deadline or they are queal, compare creation times
      return b.createdAt - a.createdAt;
    }
  } else {
    return 1;
  }
};

const AssignmentsTable = ({
  assignments = List(),
  statuses = [],
  showGroup = true,
  userId = null,
  intl: { locale }
}) =>
  <Table hover>
    <thead>
      <tr>
        <th />
        <th>
          <FormattedMessage
            id="app.assignments.name"
            defaultMessage="Assignment name"
          />
        </th>
        {showGroup &&
          <th>
            <FormattedMessage
              id="app.assignments.group"
              defaultMessage="Group"
            />
          </th>}
        <th>
          <FormattedMessage
            id="app.assignments.deadline"
            defaultMessage="Deadline"
          />
        </th>
        <th>
          <FormattedMessage
            id="app.assignments.secondDeadline"
            defaultMessage="Second deadline"
          />
        </th>
      </tr>
    </thead>
    <tbody>
      {assignments.size === 0 && <NoAssignmentTableRow />}

      {assignments.some(isLoading) && <LoadingAssignmentTableRow />}

      {assignments
        .filter(isReady)
        .map(getJsData)
        .sort(compareAssignments)
        .map(assignment =>
          <AssignmentTableRow
            key={assignment.id}
            item={assignment}
            userId={userId}
            showGroup={showGroup}
            status={statuses[assignment.id]}
            locale={locale}
          />
        )}
    </tbody>
  </Table>;

AssignmentsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  showGroup: PropTypes.bool,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  userId: PropTypes.string,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(AssignmentsTable);
