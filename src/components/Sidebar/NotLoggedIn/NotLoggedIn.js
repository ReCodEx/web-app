import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import Badge from '../../AdminLTE/Badge';
import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuItem from '../../AdminLTE/Sidebar/MenuItem';
import MenuGroup from '../../AdminLTE/Sidebar/MenuGroup';

const NotLoggedIn = ({}, {
  links: {
    LOGIN_URI,
    REGISTRATION_URI,
    BUGS_URL
  }
}) => (
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

NotLoggedIn.contextTypes = {
  links: PropTypes.object
};

export default NotLoggedIn;
