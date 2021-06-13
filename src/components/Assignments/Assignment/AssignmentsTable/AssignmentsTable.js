import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl, intlShape } from 'react-intl';

import { isReady, isLoading, getJsData } from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, { NoAssignmentTableRow, LoadingAssignmentTableRow } from '../AssignmentTableRow';
import CommentThreadContainer from '../../../../containers/CommentThreadContainer';
import { compareAssignmentsReverted } from '../../../helpers/assignments';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import { EMPTY_LIST, EMPTY_OBJ, EMPTY_ARRAY } from '../../../../helpers/common';

const fetchAssignmentStatus = (statuses, assignmentId) => {
  const assignStatus =
    statuses && Array.isArray(statuses) ? statuses.find(assignStatus => assignStatus.id === assignmentId) : null;
  return assignStatus ? assignStatus.status : '';
};

class AssignmentsTable extends Component {
  state = { dialogAssignment: null };

  openDialog = (dialogAssignment = null) => this.setState({ dialogAssignment });
  closeDialog = () => this.setState({ dialogAssignment: null });

  render() {
    const {
      assignments = EMPTY_LIST,
      assignmentEnvironmentsSelector = null,
      statuses = EMPTY_ARRAY,
      userId = null,
      stats = EMPTY_OBJ,
      isAdmin = false,
      showNames = true,
      showGroups = false,
      groupsAccessor = null,
      intl: { locale },
    } = this.props;
    return (
      <React.Fragment>
        <Table hover>
          {assignments.size > 0 && (
            <thead>
              <tr>
                <th className="shrink-col" />

                {showNames && (
                  <th>
                    <FormattedMessage id="app.assignments.name" defaultMessage="Assignment name" />
                  </th>
                )}

                {showGroups && groupsAccessor && (
                  <th>
                    <FormattedMessage id="app.assignments.group" defaultMessage="Assigned in group" />
                  </th>
                )}

                {assignmentEnvironmentsSelector && (
                  <th>
                    <FormattedMessage id="generic.runtimesShort" defaultMessage="Runtimes/Languages" />
                  </th>
                )}

                {!isAdmin && Object.keys(stats).length !== 0 && (
                  <th className="text-center text-nowrap">
                    <FormattedMessage id="app.assignments.points" defaultMessage="Points" />
                  </th>
                )}

                <th className="text-nowrap shrink-col">
                  <FormattedMessage id="app.assignments.deadline" defaultMessage="Deadline" />
                </th>

                <th className="text-nowrap shrink-col">
                  <FormattedMessage id="app.assignments.maxPointsShort" defaultMessage="Max. points" />
                </th>

                <th className="text-nowrap shrink-col">
                  <FormattedMessage id="app.assignments.secondDeadline" defaultMessage="Second deadline" />
                </th>

                <th className="text-nowrap shrink-col">
                  <FormattedMessage id="app.assignments.maxPointsShort" defaultMessage="Max. points" />
                </th>

                <th />
              </tr>
            </thead>
          )}
          <tbody>
            {assignments.size === 0 && <NoAssignmentTableRow />}

            {assignments.some(isLoading) && (
              <LoadingAssignmentTableRow colSpan={5 + (assignmentEnvironmentsSelector ? 1 : 0)} />
            )}

            {assignments
              .filter(isReady)
              .map(getJsData)
              .sort(compareAssignmentsReverted)
              .map(assignment => (
                <AssignmentTableRow
                  key={assignment.id}
                  item={assignment}
                  runtimeEnvironments={assignmentEnvironmentsSelector && assignmentEnvironmentsSelector(assignment.id)}
                  userId={userId}
                  status={fetchAssignmentStatus(statuses, assignment.id)}
                  locale={locale}
                  stats={
                    Object.keys(stats).length !== 0 ? stats.assignments.find(item => item.id === assignment.id) : null
                  }
                  isAdmin={isAdmin}
                  showNames={showNames}
                  showGroups={showGroups}
                  groupsAccessor={groupsAccessor}
                  discussionOpen={() => this.openDialog(assignment)}
                />
              ))}
          </tbody>
        </Table>

        <Modal show={this.state.dialogAssignment !== null} backdrop="static" onHide={this.closeDialog} size="large">
          {this.state.dialogAssignment && (
            <CommentThreadContainer
              threadId={this.state.dialogAssignment.id}
              title={
                <React.Fragment>
                  <FormattedMessage id="app.assignments.discussionModalTitle" defaultMessage="Public Discussion" />:{' '}
                  <LocalizedExerciseName
                    entity={{ name: '??', localizedTexts: this.state.dialogAssignment.localizedTexts }}
                  />
                </React.Fragment>
              }
              inModal
            />
          )}
        </Modal>
      </React.Fragment>
    );
  }
}

AssignmentsTable.propTypes = {
  assignments: ImmutablePropTypes.list.isRequired,
  assignmentEnvironmentsSelector: PropTypes.func,
  statuses: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  userId: PropTypes.string,
  stats: PropTypes.object,
  isAdmin: PropTypes.bool,
  showNames: PropTypes.bool,
  showGroups: PropTypes.bool,
  groupsAccessor: PropTypes.func,
  intl: intlShape.isRequired,
};

export default injectIntl(AssignmentsTable);
