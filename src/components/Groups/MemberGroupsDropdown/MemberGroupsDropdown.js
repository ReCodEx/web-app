import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import GroupsNameContainer from '../../../containers/GroupsNameContainer';
import { GroupIcon, AdminRoleIcon, SupervisorIcon, ObserverIcon, UserIcon } from '../../icons';
import withLinks from '../../../helpers/withLinks.js';

import './MemberGroupsDropdown.css';

const DropdownFragment = withLinks(
  ({ groupId, groups, title, icon, links: { GROUP_ASSIGNMENTS_URI_FACTORY } }) =>
    groups &&
    groups.length > 0 && (
      <>
        <Dropdown.Header bsPrefix="dropdown-header">
          {icon}
          {title}:
        </Dropdown.Header>

        {groups.map(id => (
          <Dropdown.Item key={id} as="span" active={groupId === id} bsPrefix="dropdown-item">
            <Link to={GROUP_ASSIGNMENTS_URI_FACTORY(id)}>
              <GroupsNameContainer groupId={id} fullName admins />
            </Link>
          </Dropdown.Item>
        ))}
      </>
    )
);

const MemberGroupsDropdown = ({ groupId = null, memberGroups }) => (
  <Dropdown>
    <Dropdown.Toggle as="span" bsPrefix="nav-link memberGroupsDropdownToggle" id="hearder-group-dropdown">
      <GroupIcon largeGapRight />
      {groupId && <GroupsNameContainer groupId={groupId} fullName />}
    </Dropdown.Toggle>

    <Dropdown.Menu>
      <DropdownFragment
        groupId={groupId}
        groups={memberGroups.admin}
        title={<FormattedMessage id="app.memberGroups.asAdmin" defaultMessage="Groups you administer" />}
        icon={<AdminRoleIcon gapRight />}
      />

      <DropdownFragment
        groupId={groupId}
        groups={memberGroups.supervisor}
        title={<FormattedMessage id="app.memberGroups.asSupervisor" defaultMessage="Groups you supervise" />}
        icon={<SupervisorIcon gapRight />}
      />

      <DropdownFragment
        groupId={groupId}
        groups={memberGroups.student}
        title={<FormattedMessage id="app.memberGroups.asStudent" defaultMessage="Groups you are member of" />}
        icon={<UserIcon gapRight />}
      />

      <DropdownFragment
        groupId={groupId}
        groups={memberGroups.observer}
        title={<FormattedMessage id="app.memberGroups.asObserver" defaultMessage="Groups you observe" />}
        icon={<ObserverIcon gapRight />}
      />

      {(!memberGroups.admin || memberGroups.admin.length === 0) &&
        (!memberGroups.supervisor || memberGroups.supervisor.length === 0) &&
        (!memberGroups.student || memberGroups.student.length === 0) &&
        (!memberGroups.observer || memberGroups.observer.length === 0) && (
          <Dropdown.Item as="span" bsPrefix="dropdown-item">
            <em className="text-center text-body-secondary">
              <FormattedMessage
                id="app.memberGroups.noGroups"
                defaultMessage="there are no groups associated with you"
              />
            </em>
          </Dropdown.Item>
        )}
    </Dropdown.Menu>
  </Dropdown>
);

DropdownFragment.propTypes = {
  groupId: PropTypes.string,
  groups: PropTypes.array,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  icon: PropTypes.element,
  links: PropTypes.object,
};

MemberGroupsDropdown.propTypes = {
  groupId: PropTypes.string,
  memberGroups: PropTypes.object.isRequired,
};

export default MemberGroupsDropdown;
