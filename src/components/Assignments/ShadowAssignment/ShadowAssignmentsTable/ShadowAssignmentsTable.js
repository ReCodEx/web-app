import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';

import { isReady, isLoading, getJsData } from '../../../../redux/helpers/resourceManager';
import ShadowAssignmentsTableRow from './ShadowAssignmentsTableRow.js';
import { compareShadowAssignments } from '../../../helpers/assignments.js';
import { LoadingIcon } from '../../../icons';
import { UserUIDataContext } from '../../../../helpers/contexts.js';
import { EMPTY_LIST, EMPTY_OBJ } from '../../../../helpers/common.js';
import withRouter, { withRouterProps } from '../../../../helpers/withRouter.js';

const ShadowAssignmentsTable = ({
  shadowAssignments = EMPTY_LIST,
  userId,
  stats = EMPTY_OBJ,
  isAdmin = false,
  intl: { locale },
  navigate,
}) => (
  <UserUIDataContext.Consumer>
    {({ openOnDoubleclick = false }) => (
      <Table hover={shadowAssignments.size > 0} className="mb-0">
        {shadowAssignments.size > 0 && (
          <thead>
            <tr>
              <th className="shrink-col" />
              <th>
                <FormattedMessage id="app.assignments.name" defaultMessage="Assignment name" />
              </th>
              <th>
                <FormattedMessage id="generic.created" defaultMessage="Created" />
              </th>
              <th>
                <FormattedMessage id="app.assignments.deadline" defaultMessage="Deadline" />
              </th>

              <th className="text-center text-nowrap">
                {!isAdmin ? (
                  <FormattedMessage id="app.assignments.points" defaultMessage="Points" />
                ) : (
                  <FormattedMessage id="app.assignments.maxPoints" defaultMessage="Max. Points" />
                )}
              </th>

              {!isAdmin && (
                <th>
                  <FormattedMessage id="app.shadowAssignmentPointsDetail.note" defaultMessage="Note" />
                </th>
              )}

              <th className="shrink-col" />
            </tr>
          </thead>
        )}
        <tbody>
          {shadowAssignments.size === 0 && (
            <tr>
              <td className="text-center em-padding text-muted">
                <FormattedMessage
                  id="app.shadowAssignmentsTable.noAssignments"
                  defaultMessage="There are no shadow assignments."
                />
              </td>
            </tr>
          )}

          {shadowAssignments.some(isLoading) && (
            <tr>
              <td className="text-center em-padding" colSpan={isAdmin ? 5 : 4}>
                <LoadingIcon gapRight />
                <FormattedMessage
                  id="app.shadowAssignmentsTable.loading"
                  defaultMessage="Loading shadow assignments..."
                />
              </td>
            </tr>
          )}

          {shadowAssignments
            .filter(isReady)
            .map(getJsData)
            .sort(compareShadowAssignments)
            .map(assignment => (
              <ShadowAssignmentsTableRow
                key={assignment.id}
                item={assignment}
                userId={userId}
                locale={locale}
                stats={
                  Object.keys(stats).length !== 0 ? stats.assignments.find(item => item.id === assignment.id) : null
                }
                isAdmin={isAdmin}
                doubleClickPush={openOnDoubleclick ? navigate : null}
              />
            ))}
        </tbody>
      </Table>
    )}
  </UserUIDataContext.Consumer>
);

ShadowAssignmentsTable.propTypes = {
  shadowAssignments: ImmutablePropTypes.list.isRequired,
  userId: PropTypes.string.isRequired,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
  navigate: withRouterProps.navigate,
};

export default withRouter(injectIntl(ShadowAssignmentsTable));
