import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuAvatar from '../../widgets/Sidebar/MenuAvatar';

const UserSwitching = ({ users = [], currentUserId, loginAs, open }) =>
  users.filter(switching => switching.user.id !== currentUserId).length > 0
    ? <ul className="sidebar-menu">
        <MenuTitle
          title={
            <FormattedMessage
              id="app.userSwitching.loginAs"
              defaultMessage="Login as"
            />
          }
        />
        {users.map(({ user: { id, fullName, avatarUrl } }) =>
          <MenuAvatar
            avatarUrl={avatarUrl}
            key={id}
            title={fullName}
            onClick={() => loginAs(id)}
            isActive={id === currentUserId}
          />
        )}
      </ul>
    : null;

UserSwitching.propTypes = {
  open: PropTypes.bool,
  users: PropTypes.array,
  currentUserId: PropTypes.string.isRequired,
  loginAs: PropTypes.func.isRequired
};

export default UserSwitching;
