import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

import Button, { TheButtonGroup } from '../../widgets/TheButton';
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
    <div className="mb-3">
      <TheButtonGroup>
        {canEdit && (
          <Link to={GROUP_EDIT_URI_FACTORY(group.id)}>
            <Button variant="warning">
              <EditIcon gapRight />
              <FormattedMessage id="app.editGroup.title" defaultMessage="Edit Group" />
            </Button>
          </Link>
        )}

        <Link to={GROUP_INFO_URI_FACTORY(group.id)}>
          <Button variant="primary">
            <GroupIcon gapRight />
            <FormattedMessage id="app.group.info" defaultMessage="Group Info" />
          </Button>
        </Link>

        {canSeeDetail && (
          <Link to={GROUP_DETAIL_URI_FACTORY(group.id)}>
            <Button variant="primary">
              <AssignmentsIcon gapRight />
              <FormattedMessage id="app.group.assignments" defaultMessage="Assignments" />
            </Button>
          </Link>
        )}

        {canLeaveJoin && !group.organizational && (
          <LeaveJoinGroupButtonContainer userId={userId} groupId={group.id} size={null} redirectAfterLeave />
        )}
      </TheButtonGroup>

      {studentEmails && (
        <a href={`mailto:?bcc=${studentEmails}`} className="float-right">
          <Button variant="outline-secondary">
            <MailIcon gapRight />
            <FormattedMessage id="app.group.mailtoAll" defaultMessage="Mail to All Students" />
          </Button>
        </a>
      )}
    </div>
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
