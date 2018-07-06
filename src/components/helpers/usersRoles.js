import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  SuperadminIcon,
  SupervisorAdminIcon,
  SupervisorIcon,
  SupervisorStudentIcon,
  UserIcon
} from '../icons';

export const roleLabels = {
  student: <FormattedMessage id="app.roles.student" defaultMessage="Student" />,
  'supervisor-student': (
    <FormattedMessage
      id="app.roles.supervisorStudent"
      defaultMessage="Supervisor-student"
    />
  ),
  supervisor: (
    <FormattedMessage id="app.roles.supervisor" defaultMessage="Supervisor" />
  ),
  'supervisor-empowered': (
    <FormattedMessage
      id="app.roles.supervisorEmpowered"
      defaultMessage="Empowered Supervisor"
    />
  ),
  superadmin: (
    <FormattedMessage
      id="app.roles.superadmin"
      defaultMessage="Main Administrator"
    />
  )
};

export const roleLabelsPlural = {
  student: (
    <FormattedMessage id="app.roles.students" defaultMessage="Students" />
  ),
  'supervisor-student': (
    <FormattedMessage
      id="app.roles.supervisorStudents"
      defaultMessage="Supervisor-students"
    />
  ),
  supervisor: (
    <FormattedMessage id="app.roles.supervisors" defaultMessage="Supervisors" />
  ),
  'supervisor-empowered': (
    <FormattedMessage
      id="app.roles.supervisorsEmpowered"
      defaultMessage="Empowered Supervisors"
    />
  ),
  superadmin: (
    <FormattedMessage
      id="app.roles.superadmins"
      defaultMessage="Main Administrators"
    />
  )
};

export const knownRoles = Object.keys(roleLabels);

const roleIcons = ({ role, ...props }) => {
  switch (role) {
    case 'superadmin':
      return <SuperadminIcon {...props} />;
    case 'supervisor-empowered':
      return <SupervisorAdminIcon {...props} />;
    case 'supervisor':
      return <SupervisorIcon {...props} />;
    case 'supervisor-student':
      return <SupervisorStudentIcon {...props} />;
    default:
      return (
        <span className="text-muted">
          <UserIcon {...props} />
        </span>
      );
  }
};

roleIcons.propTypes = {
  role: PropTypes.string.isRequired
};

export const UserRoleIcon = ({
  role,
  showTooltip = false,
  tooltipId = null,
  ...props
}) =>
  showTooltip
    ? <OverlayTrigger
        placement="bottom"
        overlay={
          <Tooltip id={tooltipId}>
            {roleLabels[role]}
          </Tooltip>
        }
      >
        {roleIcons({ role, ...props })}
      </OverlayTrigger>
    : roleIcons({ role, ...props });

UserRoleIcon.propTypes = {
  role: PropTypes.string.isRequired,
  showTooltip: PropTypes.bool,
  tooltipId: PropTypes.string
};
