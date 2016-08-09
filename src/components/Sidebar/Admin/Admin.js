import React, { PropTypes } from 'react';

import Badge from '../../AdminLTE/Badge';
import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuItem from '../../AdminLTE/Sidebar/MenuItem';
import MenuGroup from '../../AdminLTE/Sidebar/MenuGroup';

/**
 * @todo: This is just a mockup, add the actual implementation.
 */

const Admin = ({
  user,
  logout,
  createSelectGroupLink = item => `/group/${item.id}`,
  isActive = link => link === '/'
}) => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      {user &&
        <Badge
          name={user.firstName + ' ' + user.lastName}
          email={user.email}
          logout={logout} />}
    </section>
  </aside>
);

Admin.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatarUrl: PropTypes.string,
    institution: PropTypes.string
  })
};

export default Admin;
