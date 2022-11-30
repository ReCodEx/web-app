import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { defaultMemoize } from 'reselect';
import moment from 'moment';

import { isReady, isLoading, getJsData } from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, { LoadingAssignmentTableRow } from '../AssignmentTableRow';
import CommentThreadContainer from '../../../../containers/CommentThreadContainer';
import Icon, { DeleteIcon, InvertIcon, LoadingIcon, RefreshIcon, SquareIcon, VisibleIcon } from '../../../icons';
import Button, { TheButtonGroup } from '../../../widgets/TheButton';
import { compareAssignmentsReverted, isBeforeDeadline, isUpToDate } from '../../../helpers/assignments';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import { EMPTY_LIST, EMPTY_OBJ, EMPTY_ARRAY } from '../../../../helpers/common';
import { prepareInitialValues, transformSubmittedData } from '../../../forms/EditAssignmentForm';

const fetchAssignmentStatus = (statuses, assignmentId) => {
  const assignStatus =
    statuses && Array.isArray(statuses) ? statuses.find(assignStatus => assignStatus.id === assignmentId) : null;
  return assignStatus ? assignStatus.status : '';
};

class AssignmentsTable extends Component {
  state = {
    dialogAssignment: null,
    showAll: null,
    selectedAssignments: {},
    multiSync: false,
    multiVisible: false,
    multiHide: false,
    multiDelete: false,
    pendingAction: false,
  };

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

  updateSelectedAssignments = (selectedAssignments, assignments) => {
    let multiSync = false;
    let multiVisible = false;
    let multiHide = false;
    let multiDelete = false;
    assignments
      .filter(({ id }) => selectedAssignments[id])
      .forEach(assignment => {
        multiDelete = true;
        multiSync =
          multiSync ||
          (assignment.exerciseSynchronizationInfo &&
            !isUpToDate(assignment.exerciseSynchronizationInfo) &&
            assignment.exerciseSynchronizationInfo.isSynchronizationPossible);
        multiVisible =
          multiVisible || !assignment.isPublic || (assignment.visibleFrom && assignment.visibleFrom > moment().unix());
        multiHide =
          multiHide || (assignment.isPublic && (assignment.visibleFrom || assignment.visibleFrom < moment().unix()));
      });
    Object.keys(selectedAssignments).forEach(id => {});
    this.setState({ selectedAssignments, multiSync, multiVisible, multiHide, multiDelete });
  };

  selectAllAssignments = defaultMemoize(assignments => () => {
    const selectedAssignments = {};
    assignments.forEach(assignment => {
      selectedAssignments[assignment.id] = true;
    });
    this.updateSelectedAssignments(selectedAssignments, assignments);
  });

  invertSelectedAssignments = defaultMemoize(assignments => () => {
    const selectedAssignments = {};
    assignments.forEach(assignment => {
      selectedAssignments[assignment.id] = !this.state.selectedAssignments[assignment.id];
    });
    this.updateSelectedAssignments(selectedAssignments, assignments);
  });

  selectAssignmentClickHandler = defaultMemoize(assignments => ev => {
    if (ev.target && ev.target.name) {
      const id = ev.target.name;
      const selectedAssignments = {};
      assignments.forEach(assignment => {
        selectedAssignments[assignment.id] = Boolean(this.state.selectedAssignments[assignment.id]);
      });
      if (selectedAssignments[id] !== undefined) {
        selectedAssignments[id] = !selectedAssignments[id]; // flip the one...
        this.updateSelectedAssignments(selectedAssignments, assignments);
      }
    }
  });

  syncSelectedAssignments = () => {
    const { syncAssignment } = this.props;
    const assignments = this.state.selectedAssignments;
    this.setState({ pendingAction: 'sync' });
    Promise.all(
      Object.keys(assignments)
        .filter(id => assignments[id])
        .map(id => syncAssignment(id))
    ).then(() => this.setState({ pendingAction: false, multiSync: false }));
  };

  visibleSelectedAssignments = assignments => {
    const { editAssignment } = this.props;
    const selectedAssignments = assignments.filter(assignment => this.state.selectedAssignments[assignment.id]);
    this.setState({ pendingAction: 'visible' });
    Promise.all(
      selectedAssignments.map(assignment => {
        const data = transformSubmittedData(prepareInitialValues(assignment));
        data.isPublic = true;
        delete data.visibleFrom;
        data.version = assignment.version;
        return editAssignment(assignment.id, data);
      })
    ).then(() =>
      this.setState({ pendingAction: false, multiVisible: false, multiHide: selectedAssignments.length > 0 })
    );
  };

  hideSelectedAssignments = assignments => {
    const { editAssignment } = this.props;
    const selectedAssignments = assignments.filter(assignment => this.state.selectedAssignments[assignment.id]);
    this.setState({ pendingAction: 'hide' });
    Promise.all(
      selectedAssignments.map(assignment => {
        const data = transformSubmittedData(prepareInitialValues(assignment));
        data.isPublic = false;
        delete data.visibleFrom;
        data.version = assignment.version;
        return editAssignment(assignment.id, data);
      })
    ).then(() =>
      this.setState({ pendingAction: false, multiVisible: selectedAssignments.length > 0, multiHide: false })
    );
  };

  deleteSelectedAssignments = () => {
    const { deleteAssignment } = this.props;
    const assignments = this.state.selectedAssignments;
    this.setState({ pendingAction: 'delete' });
    Promise.all(
      Object.keys(assignments)
        .filter(id => assignments[id])
        .map(id => deleteAssignment(id))
    ).then(() =>
      this.setState({
        pendingAction: false,
        selectedAssignments: {},
        multiSync: false,
        multiVisible: false,
        multiDelete: false,
      })
    );
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
      syncAssignment = null,
      editAssignment = null,
      deleteAssignment = null,
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

    const multiActions = Boolean(syncAssignment || editAssignment || deleteAssignment);
    return (
      <>
        <Table hover className="mb-0">
          {assignmentsPreprocessed.length > 0 && (
            <thead>
              <tr>
                {multiActions && <th className="shrink-col" />}
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
                  setSelected={multiActions ? this.selectAssignmentClickHandler(assignmentsPreprocessedAll) : null}
                  selected={Boolean(this.state.selectedAssignments[assignment.id])}
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

          {multiActions && !someAssignmentsAreLoading && assignmentsPreprocessed.length > 0 && (
            <tfoot>
              <tr>
                <td colSpan={10}>
                  <Icon
                    icon="arrow-turn-up"
                    transform={{ rotate: 90 }}
                    className="text-muted"
                    largeGapLeft
                    largeGapRight
                  />

                  <TheButtonGroup>
                    <Button variant="primary" size="sm" onClick={this.selectAllAssignments(assignmentsPreprocessedAll)}>
                      <SquareIcon checked gapRight />
                      <FormattedMessage id="app.assignments.selectAll" defaultMessage="Select All" />
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={this.invertSelectedAssignments(assignmentsPreprocessedAll)}>
                      <InvertIcon gapRight />
                      <FormattedMessage id="app.assignments.invertSelection" defaultMessage="Invert" />
                    </Button>
                  </TheButtonGroup>

                  <TheButtonGroup className="ml-4">
                    {syncAssignment && (
                      <Button
                        variant="warning"
                        size="sm"
                        disabled={this.state.pendingAction || !this.state.multiSync}
                        onClick={this.syncSelectedAssignments}>
                        {this.state.pendingAction === 'sync' ? <LoadingIcon gapRight /> : <RefreshIcon gapRight />}
                        <FormattedMessage id="app.assignments.syncAllButton" defaultMessage="Sync with Exercise" />
                      </Button>
                    )}

                    {editAssignment && (
                      <Button
                        variant="success"
                        size="sm"
                        disabled={this.state.pendingAction || !this.state.multiVisible}
                        onClick={() => this.visibleSelectedAssignments(assignmentsPreprocessedAll)}>
                        {this.state.pendingAction === 'visible' ? <LoadingIcon gapRight /> : <VisibleIcon gapRight />}
                        <FormattedMessage id="app.assignments.showAllButton" defaultMessage="Set Visible" />
                      </Button>
                    )}

                    {editAssignment && (
                      <Button
                        variant="warning"
                        size="sm"
                        disabled={this.state.pendingAction || !this.state.multiHide}
                        onClick={() => this.hideSelectedAssignments(assignmentsPreprocessedAll)}>
                        {this.state.pendingAction === 'hide' ? (
                          <LoadingIcon gapRight />
                        ) : (
                          <VisibleIcon visible={false} gapRight />
                        )}
                        <FormattedMessage id="app.assignments.hideAllButton" defaultMessage="Set Hidden" />
                      </Button>
                    )}

                    {deleteAssignment && (
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={this.state.pendingAction || !this.state.multiDelete}
                        confirmId="deleteAssignments"
                        confirm={
                          <FormattedMessage
                            id="app.assignments.deleteAllButtonConfirm"
                            defaultMessage="Do you really wish to remove all selected assignments?"
                          />
                        }
                        onClick={this.deleteSelectedAssignments}>
                        {this.state.pendingAction === 'delete' ? <LoadingIcon gapRight /> : <DeleteIcon gapRight />}
                        <FormattedMessage id="app.assignments.deleteAllButton" defaultMessage="Delete" />
                      </Button>
                    )}
                  </TheButtonGroup>
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
              additionalPublicSwitchNote={
                <FormattedMessage
                  id="app.assignments.discussionModal.additionalSwitchNote"
                  defaultMessage="(supervisors and students of this group)"
                />
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
  syncAssignment: PropTypes.func,
  editAssignment: PropTypes.func,
  deleteAssignment: PropTypes.func,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(AssignmentsTable);
