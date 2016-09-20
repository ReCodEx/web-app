import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import Badge from '../../AdminLTE/Badge';
import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuItem from '../../AdminLTE/Sidebar/MenuItem';
import MenuGroup from '../../AdminLTE/Sidebar/MenuGroup';

const Public = ({
  isLoggedIn,
  currentUrl
}, {
  links: {
    LOGIN_URI,
    REGISTRATION_URI,
    BUGS_URL
  }
}) => (
  <ul className='sidebar-menu'>
    <MenuTitle title='ReCodEx' />
    {!isLoggedIn && (
      <MenuItem
        title={<FormattedMessage id='app.sidebar.menu.signIn' defaultMessage='Sign in' />}
        icon='sign-in'
        currentPath={currentUrl}
        link={LOGIN_URI} />
    )}
    {!isLoggedIn && (
      <MenuItem
        title={<FormattedMessage id='app.sidebar.menu.createAccount' defaultMessage='Create account' />}
        isActive={false}
        icon='user-plus'
        currentPath={currentUrl}
        link={REGISTRATION_URI} />
    )}
    <MenuItem
      title={<FormattedMessage id='app.sidebar.menu.feedbackAndBugs' defaultMessage='Feedback and bug reporting' />}
      isActive={false}
      icon='bug'
      link={BUGS_URL}
      currentPath={currentUrl}
      inNewTab={true} />
  </ul>
);

Public.propTypes = {
  currentUrl: PropTypes.string
};

Public.contextTypes = {
  links: PropTypes.object
};

export default Public;
