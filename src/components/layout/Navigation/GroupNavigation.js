import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation';
import withLinks from '../../../helpers/withLinks';
import { createGroupLinks } from './linkCreators';
import { MailIcon, UserIcon } from '../../icons';

const GroupNavigation = ({ groupId, userId = null, canViewDetail = false, canEdit = false, emails = null, links }) => (
  <Navigation
    groupId={groupId}
    userId={userId}
    emphasizeUser={Boolean(userId)}
    links={[
      userId && {
        caption: <FormattedMessage id="app.navigation.userSolution" defaultMessage="User Solutions" />,
        link: links.GROUP_USER_SOLUTIONS_URI_FACTORY(groupId, userId),
        icon: <UserIcon gapRight />,
      },
      ...createGroupLinks(links, groupId, canViewDetail, canEdit),
    ]}
    secondaryLinks={[
      emails && {
        caption: <FormattedMessage id="app.group.mailtoAll" defaultMessage="Mail to All Students" />,
        href: `mailto:?bcc=${emails}`,
        icon: <MailIcon gapRight />,
      },
    ]}
  />
);

GroupNavigation.propTypes = {
  groupId: PropTypes.string.isRequired,
  userId: PropTypes.string,
  canViewDetail: PropTypes.bool,
  canEdit: PropTypes.bool,
  emails: PropTypes.string,
  links: PropTypes.object.isRequired,
};

export default withLinks(GroupNavigation);
