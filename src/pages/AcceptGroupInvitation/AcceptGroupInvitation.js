import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import GroupsNameContainer from '../../containers/GroupsNameContainer';
import UsersNameContainer from '../../containers/UsersNameContainer';
import Page from '../../components/layout/Page';
import PageContent from '../../components/layout/PageContent';
import { AcceptIcon, AssignmentsIcon, GroupIcon, LoadingIcon } from '../../components/icons';
import InsetPanel from '../../components/widgets/InsetPanel';
import DateTime from '../../components/widgets/DateTime';
import Callout from '../../components/widgets/Callout';
import Box from '../../components/widgets/Box';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import Button, { TheButtonGroup } from '../../components/widgets/TheButton';
import Markdown from '../../components/widgets/Markdown';

import { fetchGroupInvitationIfNeeded, acceptGroupInvitation } from '../../redux/modules/groupInvitations';
import { invitationSelector, getInvitationAcceptingStatus } from '../../redux/selectors/groupInvitations';
import { groupAccessorSelector } from '../../redux/selectors/groups';
import { getLoggedInUserEffectiveRole } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { resourceStatus, getJsData } from '../../redux/helpers/resourceManager';

import { getLocalizedDescription } from '../../helpers/localizedData';
import { isStudentRole } from '../../components/helpers/usersRoles';
import withLinks from '../../helpers/withLinks';
import { safeGet } from '../../helpers/common';

class AcceptGroupInvitation extends Component {
  static loadAsync = ({ invitationId }, dispatch) => dispatch(fetchGroupInvitationIfNeeded(invitationId));

  componentDidMount() {
    this.props.loadAsync();
  }

  componentDidUpdate(prevProps) {
    if (this.props.match.params.invitationId !== prevProps.match.params.invitationId) {
      this.props.loadAsync();
    }
  }

  acceptInvitation = () => {
    const {
      invitation,
      acceptInvitation,
      history: { replace },
      links: { GROUP_ASSIGNMENTS_URI_FACTORY },
    } = this.props;

    const invitationJS = getJsData(invitation);
    if (invitationJS && invitationJS.groupId) {
      return acceptInvitation().then(() => replace(GROUP_ASSIGNMENTS_URI_FACTORY(invitationJS.groupId)));
    }
  };

  render() {
    const {
      invitation,
      acceptingStatus,
      groupAccessor,
      loggedUserId,
      effectiveRole,
      links: { GROUP_INFO_URI_FACTORY, GROUP_ASSIGNMENTS_URI_FACTORY },
      intl: { locale },
    } = this.props;

    return isStudentRole(effectiveRole) ? (
      <Page
        resource={invitation}
        icon={<AcceptIcon />}
        title={<FormattedMessage id="app.acceptGroupInvitation.title" defaultMessage="Accept Group Invitation" />}>
        {invitation => (
          <>
            {invitation && invitation.groupId ? (
              <ResourceRenderer resource={groupAccessor(invitation.groupId)}>
                {group => {
                  const hasExpired = invitation && invitation.expireAt && invitation.expireAt <= Date.now() / 1000;
                  const description = getLocalizedDescription(group, locale);
                  const alreadyMember = (safeGet(group, ['privateData', 'students']) || []).includes(loggedUserId);
                  return (
                    <Box
                      title={
                        <GroupsNameContainer
                          groupId={invitation.groupId}
                          fullName
                          translations
                          noLoadAsync
                          links={alreadyMember}
                        />
                      }
                      unlimitedHeight
                      footer={
                        <div className="text-center my-2">
                          {alreadyMember ? (
                            <TheButtonGroup>
                              <Link to={GROUP_INFO_URI_FACTORY(invitation.groupId)}>
                                <Button variant="primary">
                                  <GroupIcon gapRight />
                                  <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
                                </Button>
                              </Link>
                              <Link to={GROUP_ASSIGNMENTS_URI_FACTORY(invitation.groupId)}>
                                <Button variant="primary">
                                  <AssignmentsIcon gapRight />
                                  <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
                                </Button>
                              </Link>
                            </TheButtonGroup>
                          ) : (
                            <Button
                              disabled={
                                hasExpired ||
                                group.archived ||
                                group.organizational ||
                                (acceptingStatus && acceptingStatus !== resourceStatus.FAILED)
                              }
                              variant={acceptingStatus === resourceStatus.FAILED ? 'danger' : 'success'}
                              onClick={this.acceptInvitation}>
                              {acceptingStatus === resourceStatus.PENDING ? (
                                <LoadingIcon gapRight />
                              ) : (
                                <AcceptIcon gapRight />
                              )}
                              <FormattedMessage
                                id="app.acceptGroupInvitation.acceptAndJoin"
                                defaultMessage="Accept invitation and join the group"
                              />
                            </Button>
                          )}
                        </div>
                      }>
                      <>
                        {description && (
                          <InsetPanel>
                            <Markdown source={description} />
                          </InsetPanel>
                        )}

                        <Table bordered className="mb-0">
                          <tbody>
                            <tr>
                              <th className="shrink-col text-nowrap">
                                <FormattedMessage
                                  id="app.acceptGroupInvitation.groupAdmins"
                                  defaultMessage="Group administrators"
                                />
                                :
                              </th>
                              <td>
                                {group.primaryAdminsIds.map(id => (
                                  <div key={id}>
                                    <UsersNameContainer userId={id} showEmail="icon" />
                                  </div>
                                ))}
                              </td>
                            </tr>

                            {invitation.note && (
                              <tr>
                                <th className="shrink-col text-nowrap">
                                  <FormattedMessage
                                    id="app.acceptGroupInvitation.note"
                                    defaultMessage="Invitation note"
                                  />
                                  :
                                </th>
                                <td>{invitation.note}</td>
                              </tr>
                            )}

                            <tr>
                              <th className="shrink-col text-nowrap">
                                <FormattedMessage
                                  id="app.acceptGroupInvitation.expireAt"
                                  defaultMessage="Invitation expires at"
                                />
                                :
                              </th>
                              <td>
                                <DateTime unixts={invitation.expireAt} isDeadline showRelative />
                              </td>
                            </tr>
                          </tbody>
                        </Table>

                        {acceptingStatus === resourceStatus.FAILED && (
                          <Callout variant="danger" className="mt-3">
                            <FormattedMessage
                              id="app.acceptGroupInvitation.failed"
                              defaultMessage="Joining the group failed. Please verify the invitation data and try again."
                            />
                          </Callout>
                        )}

                        {!alreadyMember && hasExpired && (
                          <Callout variant="warning" className="mt-3">
                            <FormattedMessage
                              id="app.acceptGroupInvitation.expired"
                              defaultMessage="The invitation link has expired."
                            />
                          </Callout>
                        )}

                        {alreadyMember && (
                          <Callout variant="info" className="mt-3">
                            <FormattedMessage
                              id="app.acceptGroupInvitation.alreadyMember"
                              defaultMessage="You are already a member of the corresponding group."
                            />
                          </Callout>
                        )}
                      </>
                    </Box>
                  );
                }}
              </ResourceRenderer>
            ) : (
              <Callout variant="danger">
                <FormattedMessage
                  id="app.acceptGroupInvitation.invalidToken"
                  defaultMessage="The invitation link is not valid! Either you used a corrupted link or the invitation was removed."
                />
              </Callout>
            )}
          </>
        )}
      </Page>
    ) : (
      <PageContent
        icon={<AcceptIcon />}
        title={<FormattedMessage id="app.acceptGroupInvitation.title" defaultMessage="Accept Group Invitation" />}>
        <Callout variant="danger">
          <FormattedMessage
            id="app.acceptGroupInvitation.mustBeStudent"
            defaultMessage="The invitation links are available only to students, supervisors may not use them."
          />
        </Callout>
      </PageContent>
    );
  }
}

AcceptGroupInvitation.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      invitationId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
  invitation: ImmutablePropTypes.map,
  acceptingStatus: PropTypes.string,
  groupAccessor: PropTypes.func.isRequired,
  loggedUserId: PropTypes.string,
  effectiveRole: PropTypes.string,
  loadAsync: PropTypes.func.isRequired,
  acceptInvitation: PropTypes.func.isRequired,
  history: PropTypes.shape({
    replace: PropTypes.func.isRequired,
  }),
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
  intl: PropTypes.shape({ locale: PropTypes.string.isRequired }).isRequired,
  links: PropTypes.object,
};

export default withLinks(
  connect(
    (
      state,
      {
        match: {
          params: { invitationId },
        },
      }
    ) => ({
      invitation: invitationSelector(state, invitationId),
      acceptingStatus: getInvitationAcceptingStatus(state, invitationId),
      groupAccessor: groupAccessorSelector(state),
      loggedUserId: loggedInUserIdSelector(state),
      effectiveRole: getLoggedInUserEffectiveRole(state),
    }),
    (
      dispatch,
      {
        match: {
          params: { invitationId },
        },
      }
    ) => ({
      loadAsync: () => AcceptGroupInvitation.loadAsync({ invitationId }, dispatch),
      acceptInvitation: () => dispatch(acceptGroupInvitation(invitationId)),
    })
  )(withRouter(injectIntl(AcceptGroupInvitation)))
);
