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

export const STUDENT_ROLE = 'student';
export const SUPERVISOR_STUDENT_ROLE = 'supervisor-student';
export const SUPERVISOR_ROLE = 'supervisor';
export const EMPOWERED_SUPERVISOR_ROLE = 'empowered-supervisor';
export const SUPERADMIN_ROLE = 'superadmin';

/*
 * Labels
 */
export const roleLabels = {
  [STUDENT_ROLE]: (
    <FormattedMessage id="app.roles.student" defaultMessage="Student" />
  ),
  [SUPERVISOR_STUDENT_ROLE]: (
    <FormattedMessage
      id="app.roles.supervisorStudent"
      defaultMessage="Supervisor-student"
    />
  ),
  [SUPERVISOR_ROLE]: (
    <FormattedMessage id="app.roles.supervisor" defaultMessage="Supervisor" />
  ),
  [EMPOWERED_SUPERVISOR_ROLE]: (
    <FormattedMessage
      id="app.roles.empoweredSupervisor"
      defaultMessage="Empowered Supervisor"
    />
  ),
  [SUPERADMIN_ROLE]: (
    <FormattedMessage
      id="app.roles.superadmin"
      defaultMessage="Main Administrator"
    />
  )
};

export const roleLabelsPlural = {
  [STUDENT_ROLE]: (
    <FormattedMessage id="app.roles.students" defaultMessage="Students" />
  ),
  [SUPERVISOR_STUDENT_ROLE]: (
    <FormattedMessage
      id="app.roles.supervisorStudents"
      defaultMessage="Supervisor-students"
    />
  ),
  [SUPERVISOR_ROLE]: (
    <FormattedMessage id="app.roles.supervisors" defaultMessage="Supervisors" />
  ),
  [EMPOWERED_SUPERVISOR_ROLE]: (
    <FormattedMessage
      id="app.roles.supervisorsEmpowered"
      defaultMessage="Empowered Supervisors"
    />
  ),
  [SUPERADMIN_ROLE]: (
    <FormattedMessage
      id="app.roles.superadmins"
      defaultMessage="Main Administrators"
    />
  )
};

export const roleDescriptions = {
  [STUDENT_ROLE]: (
    <FormattedMessage
      id="app.roles.description.student"
      defaultMessage="Student is the least priviledged user who can see only groups he/she is member of and solve assignments inside these groups."
    />
  ),
  [SUPERVISOR_STUDENT_ROLE]: (
    <FormattedMessage
      id="app.roles.description.supervisorStudent"
      defaultMessage="A hybrid role, which combines supervisor and student. This role is almost as priviledged as regular supervisor, but the user is also expected to be a student. The role typically covers students nearing the completion of their study programme or graduate students who help T.A. first-year courses whilst attending advanced courses."
    />
  ),
  [SUPERVISOR_ROLE]: (
    <FormattedMessage
      id="app.roles.description.supervisor"
      defaultMessage="Supervisor of a group is basically a teacher who manages own groups and assigns exercises to students in these groups. Supervisor is also capable of creating new exercises."
    />
  ),
  [EMPOWERED_SUPERVISOR_ROLE]: (
    <FormattedMessage
      id="app.roles.description.empoweredSupervisor"
      defaultMessage="A more priviledges version of supervisor who is also capable of creating custom pipelines and configure exercises using these pipelines."
    />
  ),
  [SUPERADMIN_ROLE]: (
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
  role === STUDENT_ROLE || role === SUPERVISOR_STUDENT_ROLE;

export const isSupervisorRole = role => role && role !== STUDENT_ROLE; // all other roles are supervisors

export const isEmpoweredSupervisorRole = role =>
  role === SUPERADMIN_ROLE || role === EMPOWERED_SUPERVISOR_ROLE;

export const isSuperadminRole = role => role === SUPERADMIN_ROLE;

/*
 * Icons
 */

const roleIcons = ({ role, ...props }) => {
  switch (role) {
    case SUPERADMIN_ROLE:
      return <SuperadminIcon {...props} />;
    case [EMPOWERED_SUPERVISOR_ROLE]:
      return <EmpoweredSupervisorIcon {...props} />;
    case 'supervisor':
      return <SupervisorIcon {...props} />;
    case [SUPERVISOR_STUDENT_ROLE]:
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
