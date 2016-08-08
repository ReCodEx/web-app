import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import Badge from '../../Badge';
import MenuTitle from '../MenuTitle';
import MenuItem from '../MenuItem';
import MenuGroup from '../MenuGroup';

import {
  LOGIN_URI,
  REGISTRATION_URI,
  BUGS_URL
} from '../../../links';

const NotLoggedIn = () => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      <ul className='sidebar-menu'>
        <MenuTitle title='ReCodEx' />
        <MenuItem
          title={<FormattedMessage id='app.sidebar.signIn' defaultMessage='Sign in' />}
          icon='sign-in'
          link={LOGIN_URI} />
        <MenuItem
          title={<FormattedMessage id='app.sidebar.createAccount' defaultMessage='Create account' />}
          isActive={false}
          icon='user-plus'
          link={REGISTRATION_URI} />
        <MenuItem
          title={<FormattedMessage id='app.sidebar.bugsAndFeedback' defaultMessage='Bug reporting and your feedback' />}
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
