import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage, injectIntl } from 'react-intl';
import { defaultMemoize } from 'reselect';
import { OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';

import UsersNameContainer from '../../../containers/UsersNameContainer';
import SolutionsTable from '../../Assignments/SolutionsTable';
import LoadingSolutionsTable from '../../Assignments/SolutionsTable/LoadingSolutionsTable';
import FailedLoadingSolutionsTable from '../../Assignments/SolutionsTable/FailedLoadingSolutionsTable';
import EditShadowAssignmentPointsForm, {
  getPointsFormInitialValues,
  transformPointsFormSubmitData,
} from '../../forms/EditShadowAssignmentPointsForm';
import UsersName from '../../Users/UsersName';
import SortableTable, { SortableTableColumnDescriptor } from '../../widgets/SortableTable';
import FetchManyResourceRenderer from '../../helpers/FetchManyResourceRenderer';
import { LocalizedExerciseName } from '../../helpers/LocalizedNames';
import { getLocalizedName } from '../../../helpers/localizedData';
import { createUserNameComparator } from '../../helpers/users';
import { compareAssignments, compareShadowAssignments } from '../../helpers/assignments';
import { downloadString } from '../../../redux/helpers/api/download';
import Button from '../../widgets/TheButton';
import Icon, { DownloadIcon, LoadingIcon } from '../../icons';
import { safeGet, EMPTY_ARRAY, EMPTY_OBJ, hasPermissions } from '../../../helpers/common';
import withLinks from '../../../helpers/withLinks';
import { storageGetItem, storageSetItem } from '../../../helpers/localStorage';

import styles from './ResultsTable.less';
import escapeString from '../../helpers/escapeString';

const assignmentCellRendererCreator = defaultMemoize((rawAssignments, locale) => {
  const assignments = {};
  rawAssignments.forEach(a => (assignments[a.id] = a));
  return (points, idx, key, row) => (
    <>
      <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={`results-table-cell-${row.user.id}-${key}`}>
            {row.user.name.firstName} {row.user.name.lastName}
            {', '}
            {assignments[key] && getLocalizedName(assignments[key], locale)}
          </Tooltip>
        }>
        <span>
          {points && Number.isInteger(points.gained) ? (
            <span>
              {points.gained}
              {points.bonus > 0 && <span className={styles.bonusPoints}>+{points.bonus}</span>}
              {points.bonus < 0 && <span className={styles.malusPoints}>{points.bonus}</span>}
            </span>
          ) : (
            '-'
          )}
        </span>
      </OverlayTrigger>

      {points && points.accepted && <Icon icon="check-circle" className={`text-green ${styles.accepted}`} />}
    </>
  );
});

const shadowAssignmentCellRendererCreator = defaultMemoize((shadowAssignments, locale) => {
  const assignments = {};
  shadowAssignments.forEach(a => (assignments[a.id] = a));
  return (points, idx, key, row) => (
    <OverlayTrigger
      placement="bottom"
      overlay={
        <Tooltip id={`results-table-cell-${row.user.id}-${key}`}>
          {row.user.name.firstName} {row.user.name.lastName}
          {', '}
          {assignments[key] && getLocalizedName(assignments[key], locale)}
        </Tooltip>
      }>
      <span>{points && Number.isInteger(points.gained) ? points.gained : '-'}</span>
    </OverlayTrigger>
  );
});

// Prepare data in CSV format
const getCSVValues = (assignments, shadowAssignments, data, locale) => {
  const QUOTE = '"';
  const SEPARATOR = ';';
  const NEWLINE = '\n';
  const result = [];

  const enquote = string => `${QUOTE}${string}${QUOTE}`;

  const header = [enquote('userName'), enquote('userEmail'), enquote('totalPoints')];
  assignments.forEach(assignment => {
    header.push(enquote(escapeString(getLocalizedName(assignment, locale))));
  });
  shadowAssignments.forEach(shadowAssignment => {
    header.push(enquote(escapeString(getLocalizedName(shadowAssignment, locale))));
  });
  result.push(header);

  data.forEach(item => {
    const row = [
      enquote(`${escapeString(item.user.fullName)}`),
      item.user.privateData ? enquote(`${escapeString(item.user.privateData.email)}`) : '',
      item.total.gained,
    ];
    assignments.forEach(assignment => {
      if (!Number.isInteger(item[assignment.id].gained)) {
        row.push('');
      } else {
        const gainedPoints = item[assignment.id].gained;
        const bonusPoints = item[assignment.id].bonus;
        if (Number.isInteger(bonusPoints)) {
          if (bonusPoints > 0) {
            row.push(`${gainedPoints}+${bonusPoints}`);
          } else if (bonusPoints < 0) {
            row.push(`${gainedPoints}${bonusPoints}`); // minus sign comes with the bonusPoints value
          } else {
            row.push(gainedPoints);
          }
        }
      }
    });
    shadowAssignments.forEach(shadowAssignment => {
      row.push(Number.isInteger(item[shadowAssignment.id].gained) ? item[shadowAssignment.id].gained : '');
    });
    result.push(row);
  });

  // get string from arrays
  return result.map(row => row.join(SEPARATOR)).join(NEWLINE);
};

const localStorageShowOnlyMeKey = 'ResultsTable.showOnlyMe';

class ResultsTable extends Component {
  state = {
    dialogOpen: false,
    dialogClosing: false,
    dialogUserId: null,
    dialogAssignmentId: null,
    dialogShadowId: null,
    showOnlyMe: false,
  };

  componentDidMount() {
    this.setState({ showOnlyMe: storageGetItem(localStorageShowOnlyMeKey, false) });
  }

  toggleShowOnlyMe = () => {
    const showOnlyMe = !this.state.showOnlyMe;
    storageSetItem(localStorageShowOnlyMeKey, showOnlyMe);
    this.setState({ showOnlyMe });
  };

  openDialogAssignment = (dialogUserId, dialogAssignmentId) => {
    this.props.fetchUsersSolutions(dialogUserId, dialogAssignmentId);
    this.setState({
      dialogOpen: true,
      dialogClosing: false,
      dialogUserId,
      dialogAssignmentId,
      dialogShadowId: null,
    });
  };

  openDialogShadowAssignment = (dialogUserId, dialogShadowId) => {
    this.setState({
      dialogOpen: true,
      dialogClosing: false,
      dialogUserId,
      dialogAssignmentId: null,
      dialogShadowId,
    });
  };

  closeDialog = () => {
    if (this.state.dialogClosing) return;
    this.setState({ dialogClosing: true });

    return this.props.fetchGroupStatsIfNeeded().then(() => {
      this.setState({ dialogOpen: false, dialogClosing: false });
      return Promise.resolve();
    });
  };

  getDialogAssignment = () =>
    this.state.dialogAssignmentId &&
    this.props.assignments &&
    this.props.assignments.find(({ id }) => id === this.state.dialogAssignmentId);

  getDialogShadowAssignment = () =>
    this.state.dialogShadowId &&
    this.props.shadowAssignments &&
    this.props.shadowAssignments.find(({ id }) => id === this.state.dialogShadowId);

  getDialogPoints = () => {
    const shadowAssignment = this.getDialogShadowAssignment();
    return (
      shadowAssignment &&
      shadowAssignment.points &&
      shadowAssignment.points.find(({ awardeeId }) => awardeeId === this.state.dialogUserId)
    );
  };

  submitPointsForm = formData => {
    const { setShadowPoints } = this.props;
    return this.state.dialogShadowId
      ? setShadowPoints(this.state.dialogShadowId, transformPointsFormSubmitData(formData)).then(this.closeDialog)
      : this.closeDialog();
  };

  removeShadowPoints = () => {
    if (this.state.dialogClosing) return;

    const points = this.getDialogPoints();
    if (points && this.state.dialogUserId) {
      this.setState({ dialogClosing: true });
      return this.props.removeShadowPoints(this.state.dialogShadowId, this.state.dialogUserId, points.id).then(() => {
        this.setState({ dialogOpen: false, dialogClosing: false });
      });
    }
  };

  prepareColumnDescriptors = defaultMemoize(
    (assignments, shadowAssignments, loggedUser, locale, isTeacher, showOnlyMe = false) => {
      const {
        group,
        links: {
          ASSIGNMENT_STATS_URI_FACTORY,
          ASSIGNMENT_DETAIL_URI_FACTORY,
          SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY,
          GROUP_USER_SOLUTIONS_URI_FACTORY,
        },
      } = this.props;

      const nameComparator = createUserNameComparator(locale);

      /*
       * User Name (First Column)
       */
      const columns = [
        new SortableTableColumnDescriptor(
          'user',
          <FormattedMessage id="generic.nameOfPerson" defaultMessage="Name" />,
          {
            headerSuffix: <FormattedMessage id="app.groupResultsTable.maxPointsRow" defaultMessage="Max points:" />,
            headerSuffixClassName: styles.maxPointsRow,
            className: 'text-left',
            comparator: showOnlyMe ? null : ({ user: u1 }, { user: u2 }) => nameComparator(u1, u2),
            cellRenderer: user =>
              user && (
                <>
                  <UsersName
                    {...user}
                    currentUserId={loggedUser.id}
                    showEmail="icon"
                    showExternalIdentifiers
                    listItem
                    link={
                      isTeacher || user.id === loggedUser.id
                        ? GROUP_USER_SOLUTIONS_URI_FACTORY(group.id, user.id)
                        : false
                    }
                  />
                  {!isTeacher && user.id === loggedUser.id && hasPermissions(group, 'viewStats') && (
                    <OverlayTrigger
                      placement="bottom"
                      overlay={
                        <Tooltip id="onlyShowMe">
                          {showOnlyMe ? (
                            <FormattedMessage
                              id="app.resultsTable.cancelOnlyShowMe"
                              defaultMessage="Show all students in the group"
                            />
                          ) : (
                            <FormattedMessage
                              id="app.resultsTable.onlyShowMe"
                              defaultMessage="Hide everyone except for myself"
                            />
                          )}
                        </Tooltip>
                      }>
                      <Icon
                        icon={showOnlyMe ? 'users' : ['far', 'user-circle']}
                        largeGapLeft
                        className="text-success"
                        onClick={this.toggleShowOnlyMe}
                      />
                    </OverlayTrigger>
                  )}
                </>
              ),
          }
        ),
      ];

      /*
       * Assignments
       */
      assignments.sort(compareAssignments).forEach(assignment =>
        columns.push(
          new SortableTableColumnDescriptor(
            assignment.id,
            (
              <div className={styles.verticalText}>
                <div>
                  <Link
                    to={
                      isTeacher
                        ? ASSIGNMENT_STATS_URI_FACTORY(assignment.id)
                        : ASSIGNMENT_DETAIL_URI_FACTORY(assignment.id)
                    }>
                    <LocalizedExerciseName entity={assignment} />
                  </Link>
                </div>
              </div>
            ),
            {
              headerClassName: 'text-center',
              className: `text-center ${styles.pointsCell}`,
              headerSuffix:
                assignment.maxPointsBeforeFirstDeadline +
                (assignment.maxPointsBeforeSecondDeadline ? ` / ${assignment.maxPointsBeforeSecondDeadline}` : ''),
              headerSuffixClassName: styles.maxPointsRow,
              cellRenderer: assignmentCellRendererCreator(assignments, locale),
              isClickable: hasPermissions(assignment, 'viewAssignmentSolutions')
                ? true
                : (userId, _) => userId === loggedUser.id,
              onClick: hasPermissions(assignment, 'viewAssignmentSolutions')
                ? (userId, assignmentId) => this.openDialogAssignment(userId, assignmentId)
                : (userId, assignmentId) => userId === loggedUser.id && this.openDialogAssignment(userId, assignmentId),
            }
          )
        )
      );

      /*
       * Shadow Assignments
       */
      shadowAssignments.sort(compareShadowAssignments).forEach(shadowAssignment => {
        const isClickable = hasPermissions(shadowAssignment, 'createPoints', 'updatePoints', 'removePoints');
        columns.push(
          new SortableTableColumnDescriptor(
            shadowAssignment.id,
            (
              <div className={styles.verticalText}>
                <div>
                  <Link to={SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(shadowAssignment.id)}>
                    <LocalizedExerciseName entity={shadowAssignment} />
                  </Link>
                </div>
              </div>
            ),
            {
              className: 'text-center',
              headerSuffix: shadowAssignment.maxPoints,
              headerSuffixClassName: styles.maxPointsRow,
              cellRenderer: shadowAssignmentCellRendererCreator(shadowAssignments, locale),
              isClickable,
              onClick: isClickable ? (userId, shadowId) => this.openDialogShadowAssignment(userId, shadowId) : null,
            }
          )
        );
      });

      /*
       * Total points and optionally buttons
       */
      columns.push(
        new SortableTableColumnDescriptor(
          'total',
          <FormattedMessage id="app.resultsTable.total" defaultMessage="Total" />,
          {
            className: 'text-center',
            headerSuffixClassName: styles.maxPointsRow,
            comparator: ({ total: t1, user: u1 }, { total: t2, user: u2 }) =>
              (Number(t2 && t2.gained) || -1) - (Number(t1 && t1.gained) || -1) || nameComparator(u1, u2),
            cellRenderer: points => <strong>{points ? `${points.gained}/${points.total}` : '-/-'}</strong>,
          }
        )
      );

      if (hasPermissions(group, 'update')) {
        columns.push(
          new SortableTableColumnDescriptor('buttons', '', {
            headerSuffixClassName: styles.maxPointsRow,
            className: 'text-right',
          })
        );
      }

      return columns;
    }
  );

  // Re-format the data, so they can be rendered by the SortableTable ...
  prepareData = defaultMemoize((assignments, shadowAssignments, users, stats, showOnlyMe = false) => {
    const { loggedUser, renderActions, group } = this.props;
    if (!hasPermissions(group, 'viewStats') || showOnlyMe) {
      users = users.filter(({ id }) => id === loggedUser.id);
    }

    return users.map(user => {
      const userStats = stats.find(stat => stat.userId === user.id);
      const data = {
        id: user.id,
        selected: !showOnlyMe && user.id === loggedUser.id,
        user,
        total: userStats && userStats.points,
        buttons: renderActions && hasPermissions(group, 'update') ? renderActions(user.id) : '',
        // actually 'update' is not the right premission, but its sufficiently close :)
      };

      assignments.forEach(assignment => {
        const { points = undefined, accepted = false } = safeGet(
          userStats,
          ['assignments', a => a.id === assignment.id],
          EMPTY_OBJ
        );
        data[assignment.id] = points ? { ...points, accepted } : EMPTY_OBJ;
      });

      shadowAssignments.forEach(shadowAssignment => {
        data[shadowAssignment.id] = safeGet(
          userStats,
          ['shadowAssignments', a => a.id === shadowAssignment.id, 'points'],
          EMPTY_OBJ
        );
      });

      return data;
    });
  });

  render() {
    const {
      assignments = EMPTY_ARRAY,
      shadowAssignments = EMPTY_ARRAY,
      users = EMPTY_ARRAY,
      loggedUser,
      isSuperadmin = false,
      stats,
      group,
      userSolutionsSelector,
      userSolutionsStatusSelector,
      runtimeEnvironments,
      intl: { locale },
    } = this.props;

    const isAdmin = isSuperadmin || (group.privateData && group.privateData.admins.includes(loggedUser.id));
    const isSupervisor = group.privateData && group.privateData.supervisors.includes(loggedUser.id);
    const isObserver = group.privateData && group.privateData.observers.includes(loggedUser.id);
    const groupName = getLocalizedName(group, locale);

    return (
      <>
        <SortableTable
          hover
          columns={this.prepareColumnDescriptors(
            assignments,
            shadowAssignments,
            loggedUser,
            locale,
            isAdmin || isSupervisor || isObserver,
            this.state.showOnlyMe
          )}
          defaultOrder="user"
          data={this.prepareData(assignments, shadowAssignments, users, stats, this.state.showOnlyMe)}
          empty={
            <div className="text-center text-muted">
              <FormattedMessage
                id="app.groupResultsTableRow.noStudents"
                defaultMessage="There are currently no students in the group."
              />
            </div>
          }
          className="hover mb-0"
        />
        {(isAdmin || isSupervisor || isObserver) && (
          <div className="text-center">
            <Button
              variant="primary"
              className="my-3"
              onClick={() =>
                downloadString(
                  `${groupName}.csv`,
                  getCSVValues(
                    assignments,
                    shadowAssignments,
                    this.prepareData(assignments, shadowAssignments, users, stats, this.state.showOnlyMe),
                    locale
                  ),
                  'text/csv;charset=utf-8',
                  true // add BOM
                )
              }>
              <DownloadIcon gapRight />
              <FormattedMessage id="app.groupResultsTable.downloadCSV" defaultMessage="Download results as CSV" />
            </Button>
          </div>
        )}

        <Modal
          show={Boolean(this.state.dialogOpen && this.state.dialogUserId)}
          backdrop="static"
          onHide={this.closeDialog}
          size="xl">
          <Modal.Header closeButton>
            <Modal.Title>
              <LocalizedExerciseName entity={this.getDialogAssignment() || this.getDialogShadowAssignment()} />
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.state.dialogClosing ? (
              <div className="text-center">
                <LoadingIcon />
              </div>
            ) : (
              <>
                <UsersNameContainer userId={this.state.dialogUserId} showEmail="icon" showExternalIdentifiers large />
                <hr />

                {this.state.dialogAssignmentId && (
                  <FetchManyResourceRenderer
                    fetchManyStatus={userSolutionsStatusSelector(
                      this.state.dialogUserId,
                      this.state.dialogAssignmentId
                    )}
                    loading={<LoadingSolutionsTable />}
                    failed={<FailedLoadingSolutionsTable />}>
                    {() => (
                      <SolutionsTable
                        solutions={userSolutionsSelector(this.state.dialogUserId, this.state.dialogAssignmentId)}
                        assignmentId={this.state.dialogAssignmentId}
                        groupId={group.id}
                        runtimeEnvironments={runtimeEnvironments}
                        noteMaxlen={64}
                        compact
                      />
                    )}
                  </FetchManyResourceRenderer>
                )}

                {this.state.dialogShadowId && (
                  <EditShadowAssignmentPointsForm
                    initialValues={getPointsFormInitialValues(this.getDialogPoints(), this.state.dialogUserId)}
                    onSubmit={this.submitPointsForm}
                    maxPoints={this.getDialogShadowAssignment().maxPoints}
                    onRemovePoints={this.removeShadowPoints}
                  />
                )}
              </>
            )}
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

ResultsTable.propTypes = {
  assignments: PropTypes.array.isRequired,
  shadowAssignments: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  loggedUser: PropTypes.object.isRequired,
  isSuperadmin: PropTypes.bool,
  stats: PropTypes.array.isRequired,
  group: PropTypes.object.isRequired,
  renderActions: PropTypes.func,
  runtimeEnvironments: PropTypes.array.isRequired,
  userSolutionsSelector: PropTypes.func.isRequired,
  userSolutionsStatusSelector: PropTypes.func.isRequired,
  fetchGroupStatsIfNeeded: PropTypes.func.isRequired,
  fetchUsersSolutions: PropTypes.func.isRequired,
  setShadowPoints: PropTypes.func.isRequired,
  removeShadowPoints: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
  links: PropTypes.object,
};

export default withLinks(injectIntl(ResultsTable));
