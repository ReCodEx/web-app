import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation.js';
import withLinks from '../../../helpers/withLinks.js';
import { DashboardIcon, EditIcon, UserIcon } from '../../icons';

const UserNavigation = ({
  userId,
  canViewDetail = false,
  canEdit = false,
  isLoggedInUser = false,
  links: { DASHBOARD_URI, USER_URI_FACTORY, EDIT_USER_URI_FACTORY },
}) => (
  <Navigation
    userId={userId}
    links={[
      isLoggedInUser && {
        caption: <FormattedMessage id="app.navigation.dashboard" defaultMessage="Dashboard" />,
        link: DASHBOARD_URI,
        icon: <DashboardIcon gapRight={2} />,
      },
      canViewDetail && {
        caption: <FormattedMessage id="app.navigation.user" defaultMessage="User" />,
        link: USER_URI_FACTORY(userId),
        icon: <UserIcon gapRight={2} />,
      },
      canEdit && {
        caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
        link: EDIT_USER_URI_FACTORY(userId),
        icon: <EditIcon gapRight={2} />,
      },
    ]}
  />
);

UserNavigation.propTypes = {
  userId: PropTypes.string.isRequired,
  canViewDetail: PropTypes.bool,
  canEdit: PropTypes.bool,
  isLoggedInUser: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(UserNavigation);
