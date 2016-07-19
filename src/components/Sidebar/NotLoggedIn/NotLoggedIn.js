import React, { PropTypes } from 'react';

import Badge from '../../Badge';
import MenuTitle from '../MenuTitle';
import MenuItem from '../MenuItem';
import MenuGroup from '../MenuGroup';

import {
  LOGIN_URI
} from '../../../links';

const NotLoggedIn = () => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      <ul className='sidebar-menu'>
        <MenuTitle title='ReCodEx' />
        <MenuItem
          title='Přihlásit se'
          link={LOGIN_URI} />
      </ul>
    </section>
  </aside>
);

NotLoggedIn.propTypes = {
};

export default NotLoggedIn;
