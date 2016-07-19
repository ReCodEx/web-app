import React, { PropTypes } from 'react';

import Badge from '../../Badge';
import MenuTitle from '../MenuTitle';
import MenuItem from '../MenuItem';
import MenuGroup from '../MenuGroup';

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
