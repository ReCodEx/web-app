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
import { GroupExamsIcon } from '../../components/icons';

import { fetchGroup, fetchGroupIfNeeded, setExamPeriod, removeExamPeriod } from '../../redux/modules/groups';
import { addNotification } from '../../redux/modules/notifications';
import { groupSelector, groupDataAccessorSelector, groupTypePendingChange } from '../../redux/selectors/groups';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { isLoggedAsSuperAdmin, loggedInUserSelector } from '../../redux/selectors/users';

import withLinks from '../../helpers/withLinks';
import GroupExamStatus from '../../components/Groups/GroupExamStatus';

class GroupExams extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.params.groupId !== prevProps.params.groupId) {
      this.props.loadAsync();
    }
  }

  render() {
    const {
      group,
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
            <GroupNavigation group={group} />

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
                <Box title={<FormattedMessage id="app.groupExams.listBoxTitle" defaultMessage="Previous exams" />}>
                  {group.privateData.exams && group.privateData.exams.length > 0 ? null : (
                    <div className="text-center text-muted p-2">
                      <em>
                        <FormattedMessage
                          id="app.groupExams.noPreviousExams"
                          defaultMessage="There are no previous exams recorded."
                        />
                      </em>
                    </div>
                  )}
                </Box>
              </Col>
            </Row>
          </div>
        )}
      </Page>
    );
  }
}

GroupExams.propTypes = {
  links: PropTypes.object.isRequired,
  loadAsync: PropTypes.func.isRequired,
  reload: PropTypes.func.isRequired,
  params: PropTypes.shape({
    groupId: PropTypes.string.isRequired,
  }).isRequired,
  group: ImmutablePropTypes.map,
  currentUser: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool,
  examBeginImmediately: PropTypes.bool,
  examEndRelative: PropTypes.bool,
  examPendingChange: PropTypes.bool,
  setExamPeriod: PropTypes.func.isRequired,
  removeExamPeriod: PropTypes.func.isRequired,
  addNotification: PropTypes.func.isRequired,
};

const examFormSelector = formValueSelector('exam');

export default withLinks(
  connect(
    (state, { params: { groupId } }) => ({
      group: groupSelector(state, groupId),
      groupsAccessor: groupDataAccessorSelector(state),
      userId: loggedInUserIdSelector(state),
      currentUser: loggedInUserSelector(state),
      isSuperAdmin: isLoggedAsSuperAdmin(state),
      examBeginImmediately: examFormSelector(state, 'beginImmediately'),
      examEndRelative: examFormSelector(state, 'endRelative'),
      examPendingChange: groupTypePendingChange(state, groupId),
    }),
    (dispatch, { params: { groupId } }) => ({
      loadAsync: () => dispatch(fetchGroupIfNeeded(groupId)),
      reload: () => dispatch(fetchGroup(groupId)),
      addNotification: (...args) => dispatch(addNotification(...args)),
      setExamPeriod: (begin, end, strict) => dispatch(setExamPeriod(groupId, begin, end, strict)),
      removeExamPeriod: () => dispatch(removeExamPeriod(groupId)),
    })
  )(GroupExams)
);
