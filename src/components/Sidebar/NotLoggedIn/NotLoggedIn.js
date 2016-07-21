import React, { PropTypes } from 'react';

import Badge from '../../Badge';
import MenuTitle from '../MenuTitle';
import MenuItem from '../MenuItem';
import MenuGroup from '../MenuGroup';

import {
  LOGIN_URI,
  BUGS_URL
} from '../../../links';

const NotLoggedIn = () => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      <ul className='sidebar-menu'>
        <MenuTitle title='ReCodEx' />
        <MenuItem
          title='Přihlásit se'
          icon='sign-in'
          link={LOGIN_URI} />
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

NotLoggedIn.propTypes = {
};

export default NotLoggedIn;
