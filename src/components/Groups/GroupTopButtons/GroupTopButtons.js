import React from 'react';
import PropTypes from 'prop-types';
import { LinkContainer } from 'react-router-bootstrap';
import { FormattedMessage } from 'react-intl';

import Button from '../../widgets/FlatButton';
import LeaveJoinGroupButtonContainer from '../../../containers/LeaveJoinGroupButtonContainer';
import { GroupIcon, EditIcon, AssignmentsIcon, MailIcon } from '../../icons';
import { identity, hasPermissions } from '../../../helpers/common';
import withLinks from '../../../helpers/withLinks';

const GroupTopButtons = ({
  group,
  userId,
  canLeaveJoin,
  students = null,
  links: { GROUP_EDIT_URI_FACTORY, GROUP_DETAIL_URI_FACTORY, GROUP_INFO_URI_FACTORY },
}) => {
  const studentEmails =
    !group.organizational &&
    hasPermissions(group, 'viewStudents', 'sendEmail') &&
    students &&
    students
      .map(s => s.privateData && s.privateData.email)
      .filter(identity)
      .map(encodeURIComponent)
      .join(',');
  const canEdit = hasPermissions(group, 'update');
  const canSeeDetail = hasPermissions(group, 'viewDetail');

  return (
    <p>
      {canEdit && (
        <LinkContainer to={GROUP_EDIT_URI_FACTORY(group.id)}>
          <Button variant="warning">
            <EditIcon gapRight />
            <FormattedMessage id="app.editGroup.title" defaultMessage="Edit Group" />
          </Button>
        </LinkContainer>
      )}

      <LinkContainer to={GROUP_INFO_URI_FACTORY(group.id)}>
        <Button variant="primary">
          <GroupIcon gapRight />
          <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
        </Button>
      </LinkContainer>

      {canSeeDetail && (
        <LinkContainer to={GROUP_DETAIL_URI_FACTORY(group.id)}>
          <Button variant="primary">
            <AssignmentsIcon gapRight />
            <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
          </Button>
        </LinkContainer>
      )}

      {canLeaveJoin && !group.organizational && (
        <LeaveJoinGroupButtonContainer userId={userId} groupId={group.id} bsSize={null} redirectAfterLeave />
      )}

      {studentEmails && (
        <a href={`mailto:?bcc=${studentEmails}`} className="pull-right">
          <Button variant="default">
            <MailIcon gapRight />
            <FormattedMessage id="app.group.mailtoAll" defaultMessage="Mail to All Students" />
          </Button>
        </a>
      )}
    </p>
  );
};

GroupTopButtons.propTypes = {
  group: PropTypes.object.isRequired,
  userId: PropTypes.string.isRequired,
  canLeaveJoin: PropTypes.bool,
  students: PropTypes.array,
  links: PropTypes.object,
};

export default withLinks(GroupTopButtons);
