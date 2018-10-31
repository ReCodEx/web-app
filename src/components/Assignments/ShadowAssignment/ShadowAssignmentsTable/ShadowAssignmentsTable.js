import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';

import {
  isReady,
  isLoading,
  getJsData
} from '../../../../redux/helpers/resourceManager';
import ShadowAssignmentsTableRow from '../ShadowAssignmentsTableRow';
import { compareAssignments } from '../../../helpers/compareAssignments';
import { LoadingIcon } from '../../../icons';
import { EMPTY_LIST, EMPTY_OBJ } from '../../../../helpers/common';

const ShadowAssignmentsTable = ({
  shadowAssignments = EMPTY_LIST,
  userId = null,
  stats = EMPTY_OBJ,
  isAdmin = false,
  intl: { locale }
}) =>
  <Table hover={shadowAssignments.size > 0}>
    {shadowAssignments.size > 0 &&
      <thead>
        <tr>
          {isAdmin && <th className="shrink-col" />}
          <th>
            <FormattedMessage
              id="app.assignments.name"
              defaultMessage="Assignment name"
            />
          </th>
          <th>
            <FormattedMessage
              id="app.assignments.created"
              defaultMessage="Created"
            />
          </th>
          {!isAdmin &&
            Object.keys(stats).length !== 0 &&
            <th>
              <FormattedMessage
                id="app.assignments.points"
                defaultMessage="Points"
              />
            </th>}
          {isAdmin && <th />}
        </tr>
      </thead>}
    <tbody>
      {shadowAssignments.size === 0 &&
        <tr>
          <td className="text-center em-padding text-muted">
            <FormattedMessage
              id="app.shadowAssignmentsTable.noAssignments"
              defaultMessage="There are no shadow assignments."
            />
          </td>
        </tr>}

      {shadowAssignments.some(isLoading) &&
        <tr>
          <td className="text-center em-padding" colSpan={isAdmin ? 4 : 3}>
            <LoadingIcon gapRight />
            <FormattedMessage
              id="app.shadowAssignmentsTable.loading"
              defaultMessage="Loading shadow assignments..."
            />
          </td>
        </tr>}

      {shadowAssignments
        .filter(isReady)
        .map(getJsData)
        .sort(compareAssignments)
        .map(assignment =>
          <ShadowAssignmentsTableRow
            key={assignment.id}
            item={assignment}
            userId={userId}
            locale={locale}
            stats={
              Object.keys(stats).length !== 0
                ? stats.assignments.find(item => item.id === assignment.id)
                : null
            }
            isAdmin={isAdmin}
          />
        )}
    </tbody>
  </Table>;

ShadowAssignmentsTable.propTypes = {
  shadowAssignments: ImmutablePropTypes.list.isRequired,
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired
};

export default injectIntl(ShadowAssignmentsTable);
