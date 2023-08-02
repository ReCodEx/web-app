import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';

import Page from '../../components/layout/Page';
import { UserNavigation } from '../../components/layout/Navigation';
import Box from '../../components/widgets/Box';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Callout from '../../components/widgets/Callout';
import AllowUserButtonContainer from '../../containers/AllowUserButtonContainer';
import GroupsNameContainer from '../../containers/GroupsNameContainer';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import DateTime from '../../components/widgets/DateTime';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { takeOver } from '../../redux/modules/auth';

import { getUser, isLoggedAsSuperAdmin, isStudent } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { groupsUserIsMemberSelector, fetchManyGroupsStatus } from '../../redux/selectors/groups';

import Icon, {
  AssignmentsIcon,
  GroupIcon,
  MailIcon,
  ObserverIcon,
  ResultsIcon,
  SignInIcon,
  StudentsIcon,
  SuccessIcon,
  SuperadminIcon,
  SupervisorIcon,
  TransferIcon,
  UserIcon,
  UserProfileIcon,
  WarningIcon,
} from '../../components/icons';
import withLinks from '../../helpers/withLinks';

const MemberGroupsBox = withLinks(
  ({
    title,
    groups,
    userId,
    isStudent = false,
    links: {
      GROUP_USER_SOLUTIONS_URI_FACTORY,
      GROUP_INFO_URI_FACTORY,
      GROUP_ASSIGNMENTS_URI_FACTORY,
      GROUP_STUDENTS_URI_FACTORY,
    },
  }) => (
    <Box title={title} collapsable noPadding isOpen unlimitedHeight>
      <Table hover className="mb-1">
        <tbody>
          {groups.map(groupId => (
            <tr key={groupId}>
              <td className="full-width">
                <GroupsNameContainer groupId={groupId} fullName translations links admins />
              </td>
              <td className="text-nowrap">
                <TheButtonGroup>
                  {isStudent && (
                    <Link to={GROUP_USER_SOLUTIONS_URI_FACTORY(groupId, userId)}>
                      <Button size="xs" variant="primary">
                        <ResultsIcon gapRight />
                        <FormattedMessage id="app.groupUserSolutions.userSolutions" defaultMessage="User Solutions" />
                      </Button>
                    </Link>
                  )}

                  <Link to={GROUP_INFO_URI_FACTORY(groupId)}>
                    <Button size="xs" variant={isStudent ? 'secondary' : 'primary'}>
                      <GroupIcon gapRight />
                      <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
                    </Button>
                  </Link>

                  <Link to={GROUP_ASSIGNMENTS_URI_FACTORY(groupId)}>
                    <Button size="xs" variant={isStudent ? 'secondary' : 'primary'}>
                      <AssignmentsIcon gapRight />
                      <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
                    </Button>
                  </Link>

                  <Link to={GROUP_STUDENTS_URI_FACTORY(groupId)}>
                    <Button size="xs" variant={isStudent ? 'secondary' : 'primary'}>
                      <StudentsIcon gapRight />
                      <FormattedMessage id="app.group.students" defaultMessage="Students" />
                    </Button>
                  </Link>
                </TheButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Box>
  )
);

MemberGroupsBox.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
  groups: PropTypes.array.isRequired,
  userId: PropTypes.string.isRequired,
  isStudent: PropTypes.bool,
  links: PropTypes.object,
};

class User extends Component {
  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.params.userId !== prevProps.params.userId ||
      this.props.loggedInUserId !== prevProps.loggedInUserId
    ) {
      this.props.loadAsync();
    }
  }

  static loadAsync = ({ userId }, dispatch) => dispatch(fetchUserIfNeeded(userId));

  render() {
    const { userId, loggedInUserId, user, isSuperAdmin, memberGroups, fetchManyGroupsStatus, takeOver } = this.props;

    return (
      <Page
        resource={user}
        icon={<UserProfileIcon />}
        title={<FormattedMessage id="app.user.title" defaultMessage="User's profile" />}>
        {user => (
          <div>
            <UserNavigation userId={userId} canViewDetail canEdit={isSuperAdmin || userId === loggedInUserId} />

            {isSuperAdmin && userId !== loggedInUserId && (
              <div className="mb-3">
                <TheButtonGroup>
                  {user.privateData.isAllowed && (
                    <Button variant="primary" onClick={() => takeOver(userId)}>
                      <TransferIcon gapRight />
                      <FormattedMessage id="app.users.takeOver" defaultMessage="Login as" />
                    </Button>
                  )}

                  <AllowUserButtonContainer id={userId} />
                </TheButtonGroup>
              </div>
            )}

            {(isSuperAdmin || userId === loggedInUserId) && (
              <Box
                title={<FormattedMessage id="app.user.profileOverview" defaultMessage="Profile overview" />}
                noPadding
                unlimitedHeight>
                <Table className="mb-1">
                  <tbody>
                    <tr>
                      <td className="text-nowrap text-muted text-center pl-4">
                        <Icon icon="user-graduate" />
                      </td>
                      <td className="text-nowrap text-bold">
                        <FormattedMessage id="app.editUserProfile.titlesBeforeName" defaultMessage="Prefix Title:" />
                      </td>
                      <td className="full-width">{user.name.titlesBeforeName}</td>
                    </tr>

                    <tr>
                      <td className="text-nowrap text-muted text-center pl-4">
                        <Icon icon="user-tag" />
                      </td>
                      <td className="text-nowrap text-bold">
                        <FormattedMessage id="app.editUserProfile.firstName" defaultMessage="Given Name:" />
                      </td>
                      <td className="full-width">{user.name.firstName}</td>
                    </tr>

                    <tr>
                      <td className="text-nowrap text-muted text-center pl-4">
                        <Icon icon="user-tag" />
                      </td>
                      <td className="text-nowrap text-bold">
                        <FormattedMessage id="app.editUserProfile.lastName" defaultMessage="Surname:" />
                      </td>
                      <td className="full-width">{user.name.lastName}</td>
                    </tr>

                    <tr>
                      <td className="text-nowrap text-muted text-center pl-4">
                        <Icon icon="user-graduate" />
                      </td>
                      <td className="text-nowrap text-bold">
                        <FormattedMessage id="app.editUserProfile.titlesAfterName" defaultMessage="Suffix Title:" />
                      </td>
                      <td className="full-width">{user.name.titlesAfterName}</td>
                    </tr>

                    <tr>
                      <td className="text-nowrap text-muted text-center pl-4">
                        <MailIcon />
                      </td>
                      <td className="text-nowrap text-bold">
                        <FormattedMessage id="app.changePasswordForm.email" defaultMessage="Email:" />
                      </td>
                      <td className="full-width">
                        <a href={`mailto:${user.privateData.email}`}>{user.privateData.email}</a>
                        {user.isVerified ? (
                          <SuccessIcon className="text-success" largeGapLeft />
                        ) : (
                          <WarningIcon className="text-warning" largeGapLeft />
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="text-nowrap text-muted text-center pl-4">
                        <Icon icon="baby" />
                      </td>
                      <td className="text-nowrap text-bold">
                        <FormattedMessage id="app.user.accountCreatedAt" defaultMessage="Account Created At:" />
                      </td>
                      <td className="full-width">
                        <DateTime unixts={user.privateData.createdAt} showRelative />
                      </td>
                    </tr>

                    <tr>
                      <td className="text-nowrap text-muted text-center pl-4">
                        <SignInIcon />
                      </td>
                      <td className="text-nowrap text-bold">
                        <FormattedMessage id="app.user.lastAuthenticationAt" defaultMessage="Last Authentication At:" />
                      </td>
                      <td className="full-width">
                        <DateTime unixts={user.privateData.lastAuthenticationAt} showRelative />
                      </td>
                    </tr>

                    {user.privateData.externalIds && (
                      <tr>
                        <td className="text-nowrap text-muted text-center pl-4">
                          <Icon icon={['far', 'id-card']} />
                        </td>
                        <td className="text-nowrap text-bold">
                          <FormattedMessage
                            id="app.user.externalIds"
                            defaultMessage="Associated External Identifiers:"
                          />
                        </td>
                        <td className="full-width">
                          {Object.keys(user.privateData.externalIds)
                            .sort()
                            .map(provider => (
                              <div key={provider}>
                                <em className="mr-2">{provider}:</em>
                                <code>{user.privateData.externalIds[provider]}</code>
                              </div>
                            ))}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Box>
            )}

            <FetchManyResourceRenderer fetchManyStatus={fetchManyGroupsStatus}>
              {() => (
                <>
                  {(!memberGroups.student || memberGroups.student.length === 0) &&
                    (!memberGroups.admin || memberGroups.admin.length === 0) &&
                    (!memberGroups.supervisor || memberGroups.supervisor.length === 0) &&
                    (!memberGroups.observer || memberGroups.observer.length === 0) && (
                      <Callout variant="info">
                        <h4>
                          <FormattedMessage id="app.user.noGroupsVisible" defaultMessage="No group relationships" />
                        </h4>
                        {userId !== loggedInUserId ? (
                          <FormattedMessage
                            id="app.user.noGroupsVisibleDetail"
                            defaultMessage="The selected user has no relationship with any active group that you have the permissions to read."
                          />
                        ) : isStudent ? (
                          <FormattedMessage
                            id="app.user.noGroupsVisibleDetailSelfStudent"
                            defaultMessage="You are not a member of any groups. You need to join a group first or ask group supervisor to make you a member."
                          />
                        ) : (
                          <FormattedMessage
                            id="app.user.noGroupsVisibleDetailSelfTeacher"
                            defaultMessage="You are not supervising nor observing any groups."
                          />
                        )}
                      </Callout>
                    )}

                  {memberGroups.student && memberGroups.student.length > 0 && (
                    <MemberGroupsBox
                      title={
                        <>
                          <UserIcon gapRight className="text-muted" />
                          <FormattedMessage
                            id="app.user.studentOfGroups"
                            defaultMessage="Groups the user is student of"
                          />
                        </>
                      }
                      groups={memberGroups.student}
                      userId={userId}
                      isStudent
                    />
                  )}

                  {memberGroups.admin && memberGroups.admin.length > 0 && (
                    <MemberGroupsBox
                      title={
                        <>
                          <SuperadminIcon gapRight className="text-muted" />
                          <FormattedMessage id="app.user.adminOfGroups" defaultMessage="Groups the user administrate" />
                        </>
                      }
                      groups={memberGroups.admin}
                      userId={userId}
                    />
                  )}

                  {memberGroups.supervisor && memberGroups.supervisor.length > 0 && (
                    <MemberGroupsBox
                      title={
                        <>
                          <SupervisorIcon gapRight className="text-muted" />
                          <FormattedMessage
                            id="app.user.supervisorOfGroups"
                            defaultMessage="Groups the user supervise"
                          />
                        </>
                      }
                      groups={memberGroups.supervisor}
                      userId={userId}
                    />
                  )}

                  {memberGroups.observer && memberGroups.observer.length > 0 && (
                    <MemberGroupsBox
                      title={
                        <>
                          <ObserverIcon gapRight className="text-muted" />
                          <FormattedMessage id="app.user.observerOfGroups" defaultMessage="Groups the user observe" />
                        </>
                      }
                      groups={memberGroups.observer}
                      userId={userId}
                    />
                  )}
                </>
              )}
            </FetchManyResourceRenderer>
          </div>
        )}
      </Page>
    );
  }
}

User.propTypes = {
  userId: PropTypes.string,
  loggedInUserId: PropTypes.string,
  user: ImmutablePropTypes.map,
  isSuperAdmin: PropTypes.bool,
  isStudent: PropTypes.bool,
  memberGroups: PropTypes.object.isRequired,
  fetchManyGroupsStatus: PropTypes.string,
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  takeOver: PropTypes.func.isRequired,
};

export default connect(
  (state, { params: { userId } }) => ({
    userId,
    loggedInUserId: loggedInUserIdSelector(state),
    user: getUser(userId)(state),
    isSuperAdmin: isLoggedAsSuperAdmin(state),
    isStudent: isStudent(userId)(state),
    memberGroups: groupsUserIsMemberSelector(state, userId),
    fetchManyGroupsStatus: fetchManyGroupsStatus(state),
  }),
  (dispatch, { params }) => ({
    loadAsync: () => User.loadAsync(params, dispatch),
    takeOver: userId => dispatch(takeOver(userId)),
  })
)(User);
