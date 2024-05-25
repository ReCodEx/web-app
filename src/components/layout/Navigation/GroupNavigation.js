import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation';
import withLinks from '../../../helpers/withLinks';
import { createGroupLinks } from './linkCreators';
import { MailIcon, UserIcon, UserProfileIcon } from '../../icons';
import { hasPermissions, hasOneOfPermissions } from '../../../helpers/common';

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
          icon: <UserIcon gapRight />,
        },
        ...createGroupLinks(links, group.id, canViewDetail, canEdit, canSeeExams),
      ]}
      secondaryLinks={[
        emails && {
          caption: <FormattedMessage id="app.group.mailtoAll" defaultMessage="Mail to All Students" />,
          href: `mailto:?bcc=${emails}`,
          icon: <MailIcon gapRight />,
        },
        userId &&
          canEdit && {
            caption: <FormattedMessage id="app.navigation.userProfile" defaultMessage="User's Profile" />,
            link: links.USER_URI_FACTORY(userId),
            icon: <UserProfileIcon gapRight />,
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
