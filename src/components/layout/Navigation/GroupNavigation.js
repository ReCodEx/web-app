import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation.js';
import withLinks from '../../../helpers/withLinks.js';
import { createGroupLinks } from './linkCreators.js';
import { MailIcon, UserIcon, UserProfileIcon } from '../../icons';
import { hasPermissions, hasOneOfPermissions } from '../../../helpers/common.js';

const GroupNavigation = ({ group, userId = null, emails = null, links }) => {
  const canEdit = hasOneOfPermissions(group, 'update', 'archive', 'remove', 'relocate');
  const canViewDetail = hasPermissions(group, 'viewDetail');
  const canSeeExams =
    hasOneOfPermissions(group, 'setExamPeriod', 'removeExamPeriod') ||
    group.privateData.exams?.length > 0 ||
    group.privateData.examBegin;

  return (
    <Navigation
      groupId={group.id}
      userId={userId}
      emphasizeUser={Boolean(userId)}
      links={[
        userId && {
          caption: <FormattedMessage id="app.navigation.userSolution" defaultMessage="User Solutions" />,
          link: links.GROUP_USER_SOLUTIONS_URI_FACTORY(group.id, userId),
          icon: <UserIcon gapRight={2} />,
        },
        ...createGroupLinks(links, group.id, canViewDetail, canEdit, canSeeExams),
      ]}
      secondaryLinks={[
        emails && {
          caption: <FormattedMessage id="app.group.mailtoAll" defaultMessage="Mail to All Students" />,
          href: `mailto:?bcc=${emails}`,
          icon: <MailIcon gapRight={2} />,
        },
        userId &&
          canEdit && {
            caption: <FormattedMessage id="app.navigation.userProfile" defaultMessage="User's Profile" />,
            link: links.USER_URI_FACTORY(userId),
            icon: <UserProfileIcon gapRight={2} />,
          },
      ]}
    />
  );
};

GroupNavigation.propTypes = {
  group: PropTypes.object.isRequired,
  userId: PropTypes.string,
  emails: PropTypes.string,
  links: PropTypes.object.isRequired,
};

export default withLinks(GroupNavigation);
