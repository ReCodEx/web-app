import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { formValueSelector } from 'redux-form';
import moment from 'moment';

import UsersNameContainer from '../UsersNameContainer';
import GroupInvitations from '../../components/Groups/GroupInvitations';
import GroupInvitationForm, {
  createNewGroupInvitationInitialData,
  createEditGroupInvitationInitialData,
} from '../../components/forms/GroupInvitationForm';
import FetchManyResourceRenderer from '../../components/helpers/FetchManyResourceRenderer';
import { AddIcon } from '../../components/icons';
import Button from '../../components/widgets/TheButton';
import InsetPanel from '../../components/widgets/InsetPanel';
import DateTime from '../../components/widgets/DateTime';

import {
  fetchManyGroupInvitationsStatus,
  groupInvitationsSelector,
  groupInvitationsAccessorJS,
} from '../../redux/selectors/groupInvitations.js';
import {
  fetchGroupInvitations,
  createGroupInvitation,
  editGroupInvitation,
  deleteGroupInvitation,
} from '../../redux/modules/groupInvitations.js';

import withLinks from '../../helpers/withLinks.js';

class GroupInvitationsContainer extends Component {
  state = { dialogOpen: false, editInvitation: null };
  initialFormData = {};
  invitation = null;

  openDialog = (editInvitation = null) => {
    if (editInvitation) {
      this.invitation = this.props.inviationsAccessor(editInvitation);
      if (!this.invitation) {
        return;
      }
      this.initialFormData = createEditGroupInvitationInitialData(this.invitation);
    } else {
      this.invitation = null;
      this.initialFormData = createNewGroupInvitationInitialData();
    }
    this.setState({ dialogOpen: true, editInvitation });
  };

  closeDialog = () => {
    this.setState({ dialogOpen: false, editInvitation: null });
  };

  handleFormSubmit = ({ hasExpiration, expireAt, note }) => {
    const { actionButtons = false, groupId, createInvitation, editInvitation } = this.props;
    if (!actionButtons) {
      return Promise.resolve();
    }

    const expire = hasExpiration ? moment(expireAt).unix() : null;
    return (
      this.state.editInvitation
        ? editInvitation(this.state.editInvitation, expire, note)
        : createInvitation(groupId, expire, note)
    ).then(this.closeDialog);
  };

  componentDidMount() {
    this.props.loadAsync(this.props.groupId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.groupId !== prevProps.groupId) {
      this.props.loadAsync(this.props.groupId);
    }
  }

  render() {
    const {
      actionButtons = false,
      invitationsFetchStatus,
      invitations,
      hasExpiration = false,
      deleteInvitation,
      links: { ACCEPT_GROUP_INVITATION_URI_FACTORY },
    } = this.props;

    return (
      <FetchManyResourceRenderer fetchManyStatus={invitationsFetchStatus}>
        {() => (
          <>
            <InsetPanel size="sm" className="small">
              <FormattedMessage
                id="app.groupInvitations.explain"
                defaultMessage="Invitations are immutable links which can be sent to students by alternate communication channels. Any registred student can use a valid invitation link to join the corresponding group."
              />
            </InsetPanel>

            <GroupInvitations
              invitations={invitations}
              editInvitation={actionButtons ? this.openDialog : null}
              deleteInvitation={actionButtons ? deleteInvitation : null}
              selected={this.state.editInvitation}
            />

            {actionButtons && (
              <>
                <hr className="m-0" />

                <div className="text-center p-3">
                  <Button variant="success" onClick={() => this.openDialog()}>
                    <AddIcon gapRight={2} />
                    <FormattedMessage id="app.groupInvitations.newButton" defaultMessage="New invitation" />
                  </Button>
                </div>

                <Modal show={this.state.dialogOpen} backdrop="static" onHide={this.closeDialog} size="xl">
                  <Modal.Header closeButton>
                    <Modal.Title>
                      {this.state.editInvitation ? (
                        <FormattedMessage id="app.groupInvitations.dialog.titleEdit" defaultMessage="Edit invitation" />
                      ) : (
                        <FormattedMessage
                          id="app.groupInvitations.dialog.titleCreate"
                          defaultMessage="Create new invitation"
                        />
                      )}
                    </Modal.Title>
                  </Modal.Header>

                  <Modal.Body>
                    {this.state.editInvitation && this.invitation && (
                      <>
                        <InsetPanel className="mb-5">
                          <div>
                            <code>
                              <strong>{`${window && window.location.origin}${ACCEPT_GROUP_INVITATION_URI_FACTORY(
                                this.invitation.id
                              )}`}</strong>
                            </code>
                          </div>
                          <div className="mt-1">
                            <FormattedMessage id="generic.createdAt" defaultMessage="Created at" />:{' '}
                            <strong>
                              <DateTime unixts={this.invitation.createdAt} />
                            </strong>
                          </div>
                          <div className="mt-1">
                            <FormattedMessage id="app.groupInvitations.createdBy" defaultMessage="Created by" />:{' '}
                            {this.invitation.hostId && (
                              <strong>
                                <UsersNameContainer userId={this.invitation.hostId} isSimple />
                              </strong>
                            )}
                          </div>
                        </InsetPanel>
                      </>
                    )}

                    <GroupInvitationForm
                      initialValues={this.initialFormData}
                      hasExpiration={hasExpiration}
                      onSubmit={this.handleFormSubmit}
                    />
                  </Modal.Body>
                </Modal>
              </>
            )}
          </>
        )}
      </FetchManyResourceRenderer>
    );
  }
}

GroupInvitationsContainer.propTypes = {
  groupId: PropTypes.string.isRequired,
  actionButtons: PropTypes.bool,
  hasExpiration: PropTypes.bool,
  invitations: PropTypes.array.isRequired,
  invitationsFetchStatus: PropTypes.string,
  inviationsAccessor: PropTypes.func.isRequired,
  loadAsync: PropTypes.func.isRequired,
  createInvitation: PropTypes.func.isRequired,
  editInvitation: PropTypes.func.isRequired,
  deleteInvitation: PropTypes.func.isRequired,
  links: PropTypes.object,
};

const groupInvitationsFormSelector = formValueSelector('group-invitation');

export default connect(
  (state, { groupId }) => ({
    hasExpiration: groupInvitationsFormSelector(state, 'hasExpiration'),
    invitations: groupInvitationsSelector(state, groupId),
    invitationsFetchStatus: fetchManyGroupInvitationsStatus(state, groupId),
    inviationsAccessor: groupInvitationsAccessorJS(state),
  }),
  dispatch => ({
    loadAsync: groupId => dispatch(fetchGroupInvitations(groupId)),
    createInvitation: (groupId, expireAt, note) => dispatch(createGroupInvitation(groupId, expireAt, note)),
    editInvitation: (id, expireAt, note) => dispatch(editGroupInvitation(id, { expireAt, note })),
    deleteInvitation: id => dispatch(deleteGroupInvitation(id)),
  })
)(withLinks(GroupInvitationsContainer));
