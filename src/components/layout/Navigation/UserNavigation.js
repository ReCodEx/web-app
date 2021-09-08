import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation';
import withLinks from '../../../helpers/withLinks';
import { EditIcon, UserIcon } from '../../icons';

const UserNavigation = ({
  userId,
  canViewDetail = false,
  canEdit = false,
  links: { USER_URI_FACTORY, EDIT_USER_URI_FACTORY },
}) => (
  <Navigation
    userId={userId}
    links={[
      canViewDetail && {
        caption: <FormattedMessage id="app.navigation.user" defaultMessage="User" />,
        link: USER_URI_FACTORY(userId),
        icon: <UserIcon gapRight />,
      },
      canEdit && {
        caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
        link: EDIT_USER_URI_FACTORY(userId),
        icon: <EditIcon gapRight />,
      },
    ]}
  />
);

UserNavigation.propTypes = {
  userId: PropTypes.string.isRequired,
  canViewDetail: PropTypes.bool,
  canEdit: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(UserNavigation);
