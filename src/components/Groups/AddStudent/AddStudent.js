import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';
import { Modal } from 'react-bootstrap';
import { defaultMemoize } from 'reselect';

import ResourceRenderer from '../../helpers/ResourceRenderer';
import InviteUserForm from '../../forms/InviteUserForm';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import AddUserContainer from '../../../containers/AddUserContainer';
import Button from '../../widgets/TheButton';
import InsetPanel from '../../widgets/InsetPanel';
import Icon from '../../icons';

import { arrayToObject } from '../../../helpers/common';

const prepareInviteUserInitialValues = defaultMemoize((groups, groupId) => ({
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
}));

const prepareInviteOnSubmitHandler = defaultMemoize(
  (inviteUser, setDialogOpen, instanceId) =>
    ({ email, titlesBeforeName, firstName, lastName, titlesAfterName, groups }) => {
      email = email.trim();
      firstName = firstName.trim();
      lastName = lastName.trim();
      titlesBeforeName = titlesBeforeName.trim() || undefined;
      titlesAfterName = titlesAfterName.trim() || undefined;

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
        groups: groupIds,
      }).then(() => setDialogOpen(false));
    }
);

const AddStudent = ({ groups, groupsAccessor, groupId, instanceId, inviteUser = null }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <>
      <AddUserContainer
        instanceId={instanceId}
        id={`add-student-${groupId}`}
        createActions={({ id }) => <LeaveJoinGroupButtonContainer userId={id} groupId={groupId} />}
      />

      {inviteUser && (
        <>
          <hr />
          <div className="text-center">
            <Button size="sm" variant="primary" onClick={() => setDialogOpen(true)}>
              <Icon icon="hand-holding-heart" gapRight />
              <FormattedMessage id="app.addStudent.inviteButton" defaultMessage="Invite to Register" />
              ...
            </Button>
          </div>

          <Modal show={dialogOpen} backdrop="static" onHide={() => setDialogOpen(false)} size="xl">
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

              <ResourceRenderer resource={groups.toArray()} returnAsArray>
                {groups => (
                  <InviteUserForm
                    onSubmit={prepareInviteOnSubmitHandler(inviteUser, setDialogOpen, instanceId)}
                    initialValues={prepareInviteUserInitialValues(groups, groupId)}
                    groups={groups}
                    groupsAccessor={groupsAccessor}
                  />
                )}
              </ResourceRenderer>
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
  inviteUser: PropTypes.func,
};

export default AddStudent;
