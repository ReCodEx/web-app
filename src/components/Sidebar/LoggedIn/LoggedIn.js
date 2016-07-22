import React, { PropTypes } from 'react';
import { asyncConnect } from 'redux-connect';

import Badge from '../../Badge';
import MenuTitle from '../MenuTitle';
import MenuItem from '../MenuItem';
import MenuGroup from '../MenuGroup';

import {
  DASHBOARD_URI,
  GROUP_URI_FACTORY,
  BUGS_URL
} from '../../../links';

const LoggedIn = ({
  user,
  groups = [
    { id: 1, name: 'Programování I', abbr: 'P1', color: '#123' },
    { id: 2, name: 'Programování II', abbr: 'P2', color: '#321', notificationsCount: 2 },
    { id: 3, name: 'Jazyk C# a programovani pro .NET', abbr: 'C#', color: '#222' }
  ],
  logout,
  isActive = link => link === '/'
}) => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      <Badge
        name={user.firstName + ' ' + user.lastName}
        email={user.email}
        logout={logout} />

      <ul className='sidebar-menu'>
        <MenuTitle title={'Menu'} />
        <MenuItem
          title='Dashboard'
          isActive={isActive(DASHBOARD_URI)}
          icon='dashboard'
          link={DASHBOARD_URI} />
        <MenuGroup
          title='Skupiny'
          items={groups}
          isActive={groups.some(item => isActive(GROUP_URI_FACTORY(item.id)))}
          createLink={item => GROUP_URI_FACTORY(item.id)} />
        <MenuItem
          title='Zpětná vazba a hlášení chyb'
          isActive={false}
          icon='bug'
          link={BUGS_URL}
          inNewTab={true} />
      </ul>
    </section>
  </aside>
);

LoggedIn.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatarUrl: PropTypes.string,
    institution: PropTypes.string
  }),
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      name: PropTypes.string.isRequired,
      abbr: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
    })
  )
};

export default asyncConnect([
  {
    key: 'groups',
    promise: (params) => {
      console.log(params);
      return Promise.resolve();
    }
  }
])(LoggedIn);
