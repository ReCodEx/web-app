import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import MenuTitle from '../../widgets/Sidebar/MenuTitle';
import MenuItem from '../../widgets/Sidebar/MenuItem';

import withLinks from '../../../hoc/withLinks';

const Public = (
  {
    isLoggedIn,
    currentUrl,
    links: {
      LOGIN_URI,
      REGISTRATION_URI,
      BUGS_URL
    }
  }
) => (
  <ul className="sidebar-menu">
    <MenuTitle title="ReCodEx" />
    <MenuItem
      title={
        <FormattedMessage
          id="app.sidebar.menu.signIn"
          defaultMessage="Sign in"
        />
      }
      icon="sign-in"
      currentPath={currentUrl}
      link={LOGIN_URI}
    />
    <MenuItem
      title={
        <FormattedMessage
          id="app.sidebar.menu.createAccount"
          defaultMessage="Create account"
        />
      }
      isActive={false}
      icon="user-plus"
      currentPath={currentUrl}
      link={REGISTRATION_URI}
    />
    <MenuItem
      title={
        <FormattedMessage
          id="app.sidebar.menu.feedbackAndBugs"
          defaultMessage="Feedback and bug reporting"
        />
      }
      isActive={false}
      icon="bug"
      link={BUGS_URL}
      currentPath={currentUrl}
      inNewTab={true}
    />
  </ul>
);

Public.propTypes = {
  isLoggedIn: PropTypes.bool,
  currentUrl: PropTypes.string,
  links: PropTypes.object
};

export default withLinks(Public);
