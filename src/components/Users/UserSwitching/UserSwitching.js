import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuAvatar from '../../widgets/Sidebar/MenuAvatar';
import ResourceRenderer from '../../helpers/ResourceRenderer';

const UserSwitching = ({ users = [], currentUser, loginAs, open }) =>
  <ResourceRenderer resource={currentUser}>
    {activeUser =>
      users.filter(switching => switching.user.id !== activeUser.id).length > 0
        ? <ul className="sidebar-menu">
            <MenuTitle
              title={
                <FormattedMessage
                  id="app.userSwitching.loginAs"
                  defaultMessage="Login as"
                />
              }
            />

            {users.map(
              ({ user: { id, fullName, name: { firstName }, avatarUrl } }) =>
                <MenuAvatar
                  avatarUrl={avatarUrl}
                  key={id}
                  title={fullName}
                  firstName={firstName}
                  useGravatar={activeUser.privateData.settings.useGravatar}
                  onClick={() => loginAs(id)}
                  isActive={id === activeUser.id}
                />
            )}
          </ul>
        : null}
  </ResourceRenderer>;

UserSwitching.propTypes = {
  open: PropTypes.bool,
  users: PropTypes.array,
  currentUser: PropTypes.object.isRequired,
  loginAs: PropTypes.func.isRequired
};

export default UserSwitching;
