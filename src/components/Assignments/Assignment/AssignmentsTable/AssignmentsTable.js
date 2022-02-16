import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';

import { isReady, isLoading, getJsData } from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, { LoadingAssignmentTableRow } from '../AssignmentTableRow';
import CommentThreadContainer from '../../../../containers/CommentThreadContainer';
import { compareAssignmentsReverted, isBeforeDeadline } from '../../../helpers/assignments';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import { EMPTY_LIST, EMPTY_OBJ, EMPTY_ARRAY } from '../../../../helpers/common';

const fetchAssignmentStatus = (statuses, assignmentId) => {
  const assignStatus =
    statuses && Array.isArray(statuses) ? statuses.find(assignStatus => assignStatus.id === assignmentId) : null;
  return assignStatus ? assignStatus.status : '';
};

class AssignmentsTable extends Component {
  state = { dialogAssignment: null, showAll: null };

  openDialog = (dialogAssignment = null) => this.setState({ dialogAssignment });
  closeDialog = () => this.setState({ dialogAssignment: null });

  showAllAssignments = ev => {
    this.setState({ showAll: true });
    ev.preventDefault();
  };

  hideOldAssignments = ev => {
    this.setState({ showAll: false });
    ev.preventDefault();
  };

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
      onlyCurrent = false,
      intl: { locale },
    } = this.props;
    const someAssignmentsAreLoading = assignments.some(isLoading);
    const assignmentsPreprocessedAll = assignments
      .toArray()
      .filter(isReady)
      .map(getJsData)
      .sort(compareAssignmentsReverted);
    const assignmentsPreprocessedCurrent = onlyCurrent ? assignmentsPreprocessedAll.filter(isBeforeDeadline) : null;
    const assignmentsPreprocessed =
      onlyCurrent && !this.state.showAll ? assignmentsPreprocessedCurrent : assignmentsPreprocessedAll;

    const showSecondDeadline = assignmentsPreprocessed.some(assignment => assignment && assignment.secondDeadline);

    return (
      <>
        <Table hover className="mb-0">
          {assignmentsPreprocessed.length > 0 && (
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

                {showSecondDeadline && (
                  <th className="text-nowrap shrink-col">
                    <FormattedMessage id="app.assignments.secondDeadline" defaultMessage="Second deadline" />
                  </th>
                )}

                <th className="text-nowrap shrink-col">
                  <FormattedMessage id="app.assignments.maxPointsShort" defaultMessage="Max. points" />
                </th>

                <th />
              </tr>
            </thead>
          )}
          <tbody>
            {someAssignmentsAreLoading ? (
              <LoadingAssignmentTableRow colSpan={10} />
            ) : (
              assignmentsPreprocessedAll.length === 0 && (
                <tr>
                  <td className="text-center">
                    {showGroups ? (
                      <FormattedMessage
                        id="app.assignmentsTable.noAssignmentsInAnyGroup"
                        defaultMessage="This exercise has no assigments in any of the groups you can see."
                      />
                    ) : (
                      <FormattedMessage
                        id="app.assignmentsTable.noAssignments"
                        defaultMessage="There are no assignments yet."
                      />
                    )}
                  </td>
                </tr>
              )
            )}

            {!someAssignmentsAreLoading &&
              assignmentsPreprocessed.map(assignment => (
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
                  showSecondDeadline={showSecondDeadline}
                  groupsAccessor={groupsAccessor}
                  discussionOpen={() => this.openDialog(assignment)}
                />
              ))}
          </tbody>

          {!someAssignmentsAreLoading &&
            onlyCurrent &&
            assignmentsPreprocessedAll.length !== assignmentsPreprocessedCurrent.length && (
              <tfoot>
                <tr>
                  <td colSpan={10} className="small text-muted text-center">
                    {this.state.showAll ? (
                      <FormattedMessage
                        id="app.assignments.hidePastAssignments"
                        defaultMessage="Total {count} {count, plural, one {assignment} other {assignments}} {count, plural, one {is past its} other {are past their}} deadline. <a>Hide old assignments.</a>"
                        values={{
                          count: assignmentsPreprocessedAll.length - assignmentsPreprocessedCurrent.length,
                          a: content => (
                            <a href="" onClick={this.hideOldAssignments}>
                              {content}
                            </a>
                          ),
                        }}
                      />
                    ) : (
                      <FormattedMessage
                        id="app.assignments.showHiddenPastAssignments"
                        defaultMessage="There {count, plural, one {is} other {are}} {count} hidden {count, plural, one {assignment} other {assignments}} which {count, plural, one {is past its} other {are past their}} deadline. <a>Show all.</a>"
                        values={{
                          count: assignmentsPreprocessedAll.length - assignmentsPreprocessedCurrent.length,
                          a: content => (
                            <a href="" onClick={this.showAllAssignments}>
                              {content}
                            </a>
                          ),
                        }}
                      />
                    )}
                  </td>
                </tr>
              </tfoot>
            )}
        </Table>

        <Modal show={this.state.dialogAssignment !== null} backdrop="static" onHide={this.closeDialog} size="xl">
          {this.state.dialogAssignment && (
            <CommentThreadContainer
              threadId={this.state.dialogAssignment.id}
              title={
                <>
                  <FormattedMessage id="app.assignments.discussionModalTitle" defaultMessage="Public Discussion" />:{' '}
                  <LocalizedExerciseName
                    entity={{ name: '??', localizedTexts: this.state.dialogAssignment.localizedTexts }}
                  />
                </>
              }
              inModal
            />
          )}
        </Modal>
      </>
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
  onlyCurrent: PropTypes.bool,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(AssignmentsTable);
