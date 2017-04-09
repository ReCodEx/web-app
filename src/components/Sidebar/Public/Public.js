import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuItem from '../../AdminLTE/Sidebar/MenuItem';

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
  <ul className="sidebar-menu">
    <MenuTitle title="ReCodEx" />
    <MenuItem
      title={<FormattedMessage id="app.sidebar.menu.signIn" defaultMessage="Sign in" />}
      icon="sign-in"
      currentPath={currentUrl}
      link={LOGIN_URI} />
    <MenuItem
      title={<FormattedMessage id="app.sidebar.menu.createAccount" defaultMessage="Create account" />}
      isActive={false}
      icon="user-plus"
      currentPath={currentUrl}
      link={REGISTRATION_URI} />
    <MenuItem
        title={<FormattedMessage id="app.sidebar.menu.feedbackAndBugs" defaultMessage="Feedback and bug reporting" />}
        isActive={false}
        icon="bug"
        link={BUGS_URL}
        currentPath={currentUrl}
        inNewTab={true} />
  </ul>
);

Public.propTypes = {
  isLoggedIn: PropTypes.bool,
  currentUrl: PropTypes.string
};

Public.contextTypes = {
  links: PropTypes.object
};

export default Public;
