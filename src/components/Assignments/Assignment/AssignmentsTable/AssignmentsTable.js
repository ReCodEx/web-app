import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Modal } from 'react-bootstrap';
import { FormattedMessage, injectIntl } from 'react-intl';
import { lruMemoize } from 'reselect';
import moment from 'moment';

import { isReady, isLoading, getJsData } from '../../../../redux/helpers/resourceManager';
import AssignmentTableRow, { LoadingAssignmentTableRow } from '../AssignmentTableRow';
import CommentThreadContainer from '../../../../containers/CommentThreadContainer';
import Icon, { DeleteIcon, InvertIcon, LoadingIcon, RefreshIcon, SquareIcon, VisibleIcon } from '../../../icons';
import Button, { TheButtonGroup } from '../../../widgets/TheButton';
import { compareAssignmentsReverted, isBeforeDeadline, isUpToDate } from '../../../helpers/assignments.js';
import { LocalizedExerciseName } from '../../../helpers/LocalizedNames';
import { UserUIDataContext } from '../../../../helpers/contexts.js';
import { EMPTY_LIST, EMPTY_OBJ, EMPTY_ARRAY } from '../../../../helpers/common.js';
import { prepareInitialValues, transformSubmittedData } from '../../../forms/EditAssignmentForm';

import withRouter, { withRouterProps } from '../../../../helpers/withRouter.js';

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

  selectAllAssignments = lruMemoize(assignments => () => {
    const selectedAssignments = {};
    assignments.forEach(assignment => {
      selectedAssignments[assignment.id] = true;
    });
    this.updateSelectedAssignments(selectedAssignments, assignments);
  });

  invertSelectedAssignments = lruMemoize(assignments => () => {
    const selectedAssignments = {};
    assignments.forEach(assignment => {
      selectedAssignments[assignment.id] = !this.state.selectedAssignments[assignment.id];
    });
    this.updateSelectedAssignments(selectedAssignments, assignments);
  });

  selectAssignmentClickHandler = lruMemoize(assignments => ev => {
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
      noDiscussion = false,
      groupsAccessor = null,
      onlyCurrent = false,
      syncAssignment = null,
      editAssignment = null,
      deleteAssignment = null,
      intl: { locale },
      navigate,
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
        <UserUIDataContext.Consumer>
          {({ openOnDoubleclick = false }) => (
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
                            defaultMessage="This exercise has no assignments in any of the groups you can see."
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
                      runtimeEnvironments={
                        assignmentEnvironmentsSelector && assignmentEnvironmentsSelector(assignment.id)
                      }
                      userId={userId}
                      status={fetchAssignmentStatus(statuses, assignment.id)}
                      locale={locale}
                      stats={
                        Object.keys(stats).length !== 0
                          ? stats.assignments.find(item => item.id === assignment.id)
                          : null
                      }
                      isAdmin={isAdmin}
                      showNames={showNames}
                      showGroups={showGroups}
                      showSecondDeadline={showSecondDeadline}
                      groupsAccessor={groupsAccessor}
                      discussionOpen={noDiscussion ? null : () => this.openDialog(assignment)}
                      setSelected={multiActions ? this.selectAssignmentClickHandler(assignmentsPreprocessedAll) : null}
                      selected={Boolean(this.state.selectedAssignments[assignment.id])}
                      doubleClickPush={openOnDoubleclick ? navigate : null}
                    />
                  ))}
              </tbody>

              {!someAssignmentsAreLoading &&
                onlyCurrent &&
                assignmentsPreprocessedAll.length !== assignmentsPreprocessedCurrent.length && (
                  <tfoot>
                    <tr>
                      <td colSpan={10} className="small text-body-secondary text-center">
                        {this.state.showAll ? (
                          <FormattedMessage
                            id="app.assignments.hidePastAssignments"
                            defaultMessage="Total {count} {count, plural, one {assignment} other {assignments}} {count, plural, one {is past its} other {are past their}} deadline. <a>Hide old assignments.</a>"
                            values={{
                              count: assignmentsPreprocessedAll.length - assignmentsPreprocessedCurrent.length,
                              a: contents => (
                                <a href="" onClick={this.hideOldAssignments}>
                                  {Array.isArray(contents)
                                    ? contents.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)
                                    : contents}
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
                              a: contents => (
                                <a href="" onClick={this.showAllAssignments}>
                                  {Array.isArray(contents)
                                    ? contents.map((c, i) => <React.Fragment key={i}>{c}</React.Fragment>)
                                    : contents}
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
                        className="text-body-secondary"
                        gapLeft={3}
                        gapRight={3}
                      />

                      <TheButtonGroup>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={this.selectAllAssignments(assignmentsPreprocessedAll)}>
                          <SquareIcon checked gapRight={2} />
                          <FormattedMessage id="app.assignments.selectAll" defaultMessage="Select All" />
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={this.invertSelectedAssignments(assignmentsPreprocessedAll)}>
                          <InvertIcon gapRight={2} />
                          <FormattedMessage id="app.assignments.invertSelection" defaultMessage="Invert" />
                        </Button>
                      </TheButtonGroup>

                      <TheButtonGroup className="ms-4">
                        {syncAssignment && (
                          <Button
                            variant="warning"
                            size="sm"
                            disabled={this.state.pendingAction || !this.state.multiSync}
                            onClick={this.syncSelectedAssignments}>
                            {this.state.pendingAction === 'sync' ? (
                              <LoadingIcon gapRight={2} />
                            ) : (
                              <RefreshIcon gapRight={2} />
                            )}
                            <FormattedMessage id="app.assignments.syncAllButton" defaultMessage="Sync with Exercise" />
                          </Button>
                        )}

                        {editAssignment && (
                          <Button
                            variant="success"
                            size="sm"
                            disabled={this.state.pendingAction || !this.state.multiVisible}
                            onClick={() => this.visibleSelectedAssignments(assignmentsPreprocessedAll)}>
                            {this.state.pendingAction === 'visible' ? (
                              <LoadingIcon gapRight={2} />
                            ) : (
                              <VisibleIcon gapRight={2} />
                            )}
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
                              <LoadingIcon gapRight={2} />
                            ) : (
                              <VisibleIcon visible={false} gapRight={2} />
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
                            {this.state.pendingAction === 'delete' ? (
                              <LoadingIcon gapRight={2} />
                            ) : (
                              <DeleteIcon gapRight={2} />
                            )}
                            <FormattedMessage id="app.assignments.deleteAllButton" defaultMessage="Delete" />
                          </Button>
                        )}
                      </TheButtonGroup>
                    </td>
                  </tr>
                </tfoot>
              )}
            </Table>
          )}
        </UserUIDataContext.Consumer>

        {!noDiscussion && (
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
                displayAs="modal"
              />
            )}
          </Modal>
        )}
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
  noDiscussion: PropTypes.bool,
  groupsAccessor: PropTypes.func,
  onlyCurrent: PropTypes.bool,
  syncAssignment: PropTypes.func,
  editAssignment: PropTypes.func,
  deleteAssignment: PropTypes.func,
  intl: PropTypes.object.isRequired,
  navigate: withRouterProps.navigate,
};

export default withRouter(injectIntl(AssignmentsTable));
