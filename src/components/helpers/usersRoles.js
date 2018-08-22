import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import {
  SuperadminIcon,
  EmpoweredSupervisorIcon,
  SupervisorIcon,
  SupervisorStudentIcon,
  UserIcon
} from '../icons';

/*
 * Labels
 */
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
  'empowered-supervisor': (
    <FormattedMessage
      id="app.roles.empoweredSupervisor"
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
  'empowered-supervisor': (
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

export const roleDescriptions = {
  student: (
    <FormattedMessage
      id="app.roles.description.student"
      defaultMessage="Student is the least priviledged user who can see only groups he/she is member of and solve assignments inside these groups."
    />
  ),
  'supervisor-student': (
    <FormattedMessage
      id="app.roles.description.supervisorStudent"
      defaultMessage="A hybrid role, which combines supervisor and student. This role is almost as priviledged as regular supervisor, but the user is also expected to be a student. The role typically covers students nearing the completion of their study programme or graduate students who help T.A. first-year courses whilst attending advanced courses."
    />
  ),
  supervisor: (
    <FormattedMessage
      id="app.roles.description.supervisor"
      defaultMessage="Supervisor of a group is basically a teacher who manages own groups and assigns exercises to students in these groups. Supervisor is also capable of creating new exercises."
    />
  ),
  'empowered-supervisor': (
    <FormattedMessage
      id="app.roles.description.empoweredSupervisor"
      defaultMessage="A more priviledges version of supervisor who is also capable of creating custom pipelines and configure exercises using these pipelines."
    />
  ),
  superadmin: (
    <FormattedMessage
      id="app.roles.description.superadmin"
      defaultMessage="Omnipotent and omniscient user who can do anything in the instances to which he/she belongs to. Similar to root in linux or Q in Startrek."
    />
  )
};

export const knownRoles = Object.keys(roleLabels);

/*
 * Helper Functions
 */

export const isStudentRole = role =>
  role === 'student' || role === 'supervisor-student';

export const isSupervisorRole = role => role && role !== 'student'; // all other roles are supervisors

export const isSuperadminRole = role => role === 'superadmin';

/*
 * Icons
 */

const roleIcons = ({ role, ...props }) => {
  switch (role) {
    case 'superadmin':
      return <SuperadminIcon {...props} />;
    case 'empowered-supervisor':
      return <EmpoweredSupervisorIcon {...props} />;
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
