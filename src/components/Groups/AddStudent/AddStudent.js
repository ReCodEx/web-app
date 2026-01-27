import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Modal, Row, Col } from 'react-bootstrap';
import { lruMemoize } from 'reselect';

import ResourceRenderer from '../../helpers/ResourceRenderer';
import InviteUserForm from '../../forms/InviteUserForm';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import AddUserContainer from '../../../containers/AddUserContainer';
import Button from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import Icon, { InfoIcon, SuccessIcon } from '../../icons';

import { arrayToObject, EMPTY_ARRAY } from '../../../helpers/common.js';
import Callout from '../../widgets/Callout/Callout.js';

const prepareInviteUserInitialValues = lruMemoize((groups, groupId) => ({
  titlesBeforeName: '',
  firstName: '',
  lastName: '',
  titlesAfterName: '',
  email: '',
  groups: arrayToObject(
    groups,
    group => `id${group.id}`,
    group => group.id === groupId
  ),
  ignoreNameCollision: undefined,
}));

const prepareInviteOnSubmitHandler = lruMemoize(
  (inviteUser, setMatchingUsers, setUserInvited, instanceId) =>
    ({ email, titlesBeforeName, firstName, lastName, titlesAfterName, groups, ignoreNameCollision }) => {
      email = email.trim();
      firstName = firstName.trim();
      lastName = lastName.trim();
      titlesBeforeName = titlesBeforeName.trim() || undefined;
      titlesAfterName = titlesAfterName.trim() || undefined;
      ignoreNameCollision = Boolean(ignoreNameCollision);

      const groupIds = Object.keys(groups)
        .filter(key => groups[key])
        .map(key => key.substring(2));

      return inviteUser({
        email,
        titlesBeforeName,
        firstName,
        lastName,
        titlesAfterName,
        instanceId,
        ignoreNameCollision,
        groups: groupIds,
      }).then(({ value }) => {
        if (value === 'OK') {
          setUserInvited(true);
          setMatchingUsers(EMPTY_ARRAY);
          return true;
        } else {
          setMatchingUsers(value);
          return false;
        }
      });
    }
);

const AddStudent = ({ groups, groupsAccessor, groupId, instanceId, canSearch = false, inviteUser = null }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [userInvited, setUserInvited] = useState(true);
  const [matchingUsers, setMatchingUsers] = useState(EMPTY_ARRAY);

  return (
    <>
      {canSearch ? (
        <AddUserContainer
          instanceId={instanceId}
          id={`add-student-${groupId}`}
          createActions={({ id }) => <LeaveJoinGroupButtonContainer userId={id} groupId={groupId} />}
        />
      ) : (
        <div className="text-center text-body-secondary small">
          <FormattedMessage
            id="app.addStudent.cannotSearch"
            defaultMessage="You do not have permissions to search students, so you cannot add them explicitly."
          />
        </div>
      )}

      {inviteUser && (
        <>
          <InsetPanel className="mb-1 mt-3">
            <Row>
              <Col xs={12} sm>
                <small className="text-secondary">
                  <InfoIcon gapRight={2} />
                  <FormattedMessage
                    id="app.addStudent.inviteExplanation"
                    defaultMessage="If the student you want to add is not registered yet, you can send them an invitation link. It will allow them to register and automatically join this group."
                  />
                </small>
              </Col>
              <Col xs={false} sm="auto" className="align-self-center">
                <Button
                  variant="primary"
                  onClick={() => {
                    setUserInvited(false);
                    setMatchingUsers(EMPTY_ARRAY);
                    setDialogOpen(true);
                  }}>
                  <Icon icon="hand-holding-heart" gapRight={2} />
                  <FormattedMessage id="app.addStudent.inviteButton" defaultMessage="Invite to Register" />
                  ...
                </Button>
              </Col>
            </Row>
          </InsetPanel>

          <Modal
            show={dialogOpen}
            onHide={() => setDialogOpen(false)}
            onEscapeKeyDown={() => setDialogOpen(false)}
            size="xl">
            <Modal.Header closeButton>
              <Modal.Title>
                <FormattedMessage id="app.addStudent.inviteDialog.title" defaultMessage="Send invitation to ReCodEx" />
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <InsetPanel>
                <FormattedMessage
                  id="app.addStudent.inviteDialog.explain"
                  defaultMessage="An invitation will be sent to the user at given email address. The user will receive a link for registration as a local user. User profile details (name and email) must be filled in correctly, since the user will not be able to modify them. Optionally, you may select a list of groups to which the user will be assigned immediately after registration."
                />
              </InsetPanel>

              {userInvited ? (
                <Callout variant="success" className="mb-4">
                  <p>
                    <FormattedMessage
                      id="app.addStudent.inviteDialog.userInvited"
                      defaultMessage="An invitation was sent to the specified email address. The user must accept it to complete the registration process."
                    />
                  </p>
                  <div className="text-end">
                    <Button onClick={() => setDialogOpen(false)} variant="success">
                      <SuccessIcon gapRight={2} />
                      <FormattedMessage id="generic.close" defaultMessage="Close" />
                    </Button>
                  </div>
                </Callout>
              ) : (
                <ResourceRenderer resourceArray={groups}>
                  {groups => (
                    <InviteUserForm
                      onSubmit={prepareInviteOnSubmitHandler(inviteUser, setMatchingUsers, setUserInvited, instanceId)}
                      initialValues={prepareInviteUserInitialValues(groups, groupId)}
                      groups={groups}
                      groupsAccessor={groupsAccessor}
                      matchingUsers={matchingUsers}
                    />
                  )}
                </ResourceRenderer>
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
};

AddStudent.propTypes = {
  instanceId: PropTypes.string.isRequired,
  groups: ImmutablePropTypes.map,
  groupsAccessor: PropTypes.func.isRequired,
  groupId: PropTypes.string.isRequired,
  canSearch: PropTypes.bool,
  inviteUser: PropTypes.func,
};

export default AddStudent;
