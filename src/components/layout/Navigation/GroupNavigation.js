import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation';
import withLinks from '../../../helpers/withLinks';
import { createGroupLinks } from './linkCreators';
import { MailIcon } from '../../icons';

const GroupNavigation = ({ groupId, canViewDetail = false, canEdit = false, emails = null, links }) => (
  <Navigation
    groupId={groupId}
    links={createGroupLinks(links, groupId, canViewDetail, canEdit)}
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
  canViewDetail: PropTypes.bool,
  canEdit: PropTypes.bool,
  emails: PropTypes.string,
  links: PropTypes.object.isRequired,
};

export default withLinks(GroupNavigation);
