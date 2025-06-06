import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Row, Col } from 'react-bootstrap';
import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';

import Page from '../../components/layout/Page';
import { GroupNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import GroupArchivedWarning from '../../components/Groups/GroupArchivedWarning';
import GroupExamsTable from '../../components/Groups/GroupExamsTable';
import GroupExamStatus from '../../components/Groups/GroupExamStatus';
import LockedStudentsTable from '../../components/Groups/LockedStudentsTable';
import LocksTable from '../../components/Groups/LocksTable';
import { GroupExamsIcon } from '../../components/icons';

import { fetchGroup, fetchGroupIfNeeded, setExamPeriod, removeExamPeriod } from '../../redux/modules/groups.js';
import { fetchGroupExamLocksIfNeeded } from '../../redux/modules/groupExamLocks.js';
import { fetchByIds } from '../../redux/modules/users.js';
import { addNotification } from '../../redux/modules/notifications.js';
import { groupSelector, groupDataAccessorSelector, groupTypePendingChange } from '../../redux/selectors/groups.js';
import { groupExamLocksSelector } from '../../redux/selectors/groupExamLocks.js';
import { lockedStudentsOfGroupSelector } from '../../redux/selectors/usersGroups.js';
import { loggedInUserIdSelector } from '../../redux/selectors/auth.js';
import { isLoggedAsSuperAdmin, loggedInUserSelector } from '../../redux/selectors/users.js';
import { getJsData } from '../../redux/helpers/resourceManager';

import withLinks from '../../helpers/withLinks.js';
import { hasPermissions, safeGet } from '../../helpers/common.js';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import { isExam } from '../../helpers/groups.js';

const REFRESH_INTERVAL = 1; // [s]

class GroupExams extends Component {
  state = { examInProgress: false };
  intervalHandler = null;

  static loadAsync = ({ groupId }, dispatch) =>
    Promise.all([
      dispatch(fetchGroupIfNeeded(groupId)).then(({ value: group }) =>
        hasPermissions(group, 'viewStudents')
          ? dispatch(fetchByIds(safeGet(group, ['privateData', 'students']) || []))
          : Promise.resolve()
      ),
    ]);

  static getDerivedStateFromProps({ group }) {
    const groupJs = getJsData(group);
    const examInProgress = Boolean(groupJs && isExam(groupJs));
    return { examInProgress };
  }

  periodicRefresh = () => {
    const newState = GroupExams.getDerivedStateFromProps(this.props, this.state);
    if (newState.examInProgress !== this.state.examInProgress) {
      this.setState(newState);
    }
  };

  componentDidMount() {
    this.props.loadAsync();
    if (this.props.params.examId) {
      this.props.loadGroupExamLocks();
    }

    if (window && 'setInterval' in window) {
      if (this.intervalHandler) {
        window.clearInterval(this.intervalHandler);
      }
      this.intervalHandler = window.setInterval(this.periodicRefresh, REFRESH_INTERVAL * 1000);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.groupId !== prevProps.params.groupId) {
      this.props.loadAsync();
    }
    if (this.props.params.examId !== prevProps.params.examId && this.props.params.examId) {
      this.props.loadGroupExamLocks();
    }
  }

  componentWillUnmount() {
    if (this.intervalHandler) {
      window.clearInterval(this.intervalHandler);
      this.intervalHandler = null;
    }
  }

  linkFactory = id => {
    const {
      params: { groupId, examId = null },
      links: { GROUP_EXAMS_URI_FACTORY, GROUP_EXAMS_SPECIFIC_EXAM_URI_FACTORY },
    } = this.props;
    return String(id) === String(examId)
      ? GROUP_EXAMS_URI_FACTORY(groupId)
      : GROUP_EXAMS_SPECIFIC_EXAM_URI_FACTORY(groupId, id);
  };

  render() {
    const {
      params: { examId = null },
      group,
      lockedStudents,
      groupExamLocks,
      currentUser,
      groupsAccessor,
      examBeginImmediately,
      examEndRelative,
      setExamPeriod,
      removeExamPeriod,
      addNotification,
      links: { GROUP_EDIT_URI_FACTORY },
    } = this.props;

    return (
      <Page
        resource={[group, currentUser]}
        icon={<GroupExamsIcon />}
        title={<FormattedMessage id="app.groupExams.title" defaultMessage="Group Exam Terms" />}>
        {(group, currentUser) => (
          <div>
            {group.privateData && <GroupNavigation group={group} />}

            <GroupArchivedWarning {...group} groupsDataAccessor={groupsAccessor} linkFactory={GROUP_EDIT_URI_FACTORY} />

            <Row>
              <Col xs={12} xl={6}>
                <GroupExamStatus
                  group={group}
                  currentUser={currentUser}
                  examBeginImmediately={examBeginImmediately}
                  examEndRelative={examEndRelative}
                  setExamPeriod={setExamPeriod}
                  removeExamPeriod={removeExamPeriod}
                  addNotification={addNotification}
                />
              </Col>

              <Col xs={12} xl={6}>
                <Box
                  title={<FormattedMessage id="app.groupExams.listBoxTitle" defaultMessage="Previous exams" />}
                  noPadding
                  unlimitedHeight>
                  <GroupExamsTable
                    exams={group.privateData.exams}
                    selected={this.state.examInProgress ? null : examId}
                    linkFactory={this.state.examInProgress ? null : this.linkFactory}
                  />
                </Box>
              </Col>
            </Row>

            {(examId || this.state.examInProgress) && hasPermissions(group, 'viewStudents', 'setExamPeriod') && (
              <Row>
                <Col xs={12}>
                  <Box
                    title={
                      <>
                        {this.state.examInProgress ? (
                          <FormattedMessage
                            id="app.groupExams.studentsBoxTitle"
                            defaultMessage="Participating students"
                          />
                        ) : (
                          <FormattedMessage
                            id="app.groupExams.locksBoxTitle"
                            defaultMessage="Recorded student locking events"
                          />
                        )}
                      </>
                    }
                    customIcons={
                      this.state.examInProgress && lockedStudents && lockedStudents.length >= 0 ? (
                        <small className="text-body-secondary opacity-50 me-3">
                          <FormattedMessage
                            id="app.groupExams.studentsCount"
                            defaultMessage="({count, plural, one {# student} other {# students}})"
                            values={{ count: lockedStudents ? lockedStudents.length : 0 }}
                          />
                        </small>
                      ) : null
                    }
                    noPadding
                    unlimitedHeight>
                    {this.state.examInProgress ? (
                      <LockedStudentsTable
                        groupId={group.id}
                        lockedStudents={lockedStudents}
                        currentUser={currentUser}
                      />
                    ) : (
                      groupExamLocks && (
                        <ResourceRenderer resource={groupExamLocks} bulkyLoading>
                          {locks => <LocksTable locks={locks} />}
                        </ResourceRenderer>
                      )
                    )}
                  </Box>
                </Col>
              </Row>
            )}
          </div>
        )}
      </Page>
    );
  }
}

GroupExams.propTypes = {
  links: PropTypes.object.isRequired,
  params: PropTypes.shape({
    groupId: PropTypes.string.isRequired,
    examId: PropTypes.string,
  }).isRequired,
  group: ImmutablePropTypes.map,
  currentUser: ImmutablePropTypes.map,
  lockedStudents: PropTypes.array,
  groupsAccessor: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool,
  examBeginImmediately: PropTypes.bool,
  examEndRelative: PropTypes.bool,
  examPendingChange: PropTypes.bool,
  groupExamLocks: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired,
  loadGroupExamLocks: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  setExamPeriod: PropTypes.func.isRequired,
  removeExamPeriod: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
};

const examFormSelector = formValueSelector('exam');

export default withLinks(
  connect(
    (state, { params: { groupId, examId } }) => ({
      group: groupSelector(state, groupId),
      groupsAccessor: groupDataAccessorSelector(state),
      lockedStudents: lockedStudentsOfGroupSelector(state, groupId),
      userId: loggedInUserIdSelector(state),
      currentUser: loggedInUserSelector(state),
      isSuperAdmin: isLoggedAsSuperAdmin(state),
      examBeginImmediately: examFormSelector(state, 'beginImmediately'),
      examEndRelative: examFormSelector(state, 'endRelative'),
      examPendingChange: groupTypePendingChange(state, groupId),
      groupExamLocks: examId ? groupExamLocksSelector(state, groupId, examId) : null,
    }),
    (dispatch, { params: { groupId, examId } }) => ({
      loadAsync: () => GroupExams.loadAsync({ groupId, examId }, dispatch),
      loadGroupExamLocks: () => dispatch(fetchGroupExamLocksIfNeeded(groupId, examId)),
      reload: () => dispatch(fetchGroup(groupId)),
      addNotification: (...args) => dispatch(addNotification(...args)),
      setExamPeriod: (begin, end, strict) => dispatch(setExamPeriod(groupId, begin, end, strict)),
      removeExamPeriod: () => dispatch(removeExamPeriod(groupId)),
    })
  )(GroupExams)
);
