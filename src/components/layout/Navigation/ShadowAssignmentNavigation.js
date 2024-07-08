import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import Navigation from './Navigation.js';
import withLinks from '../../../helpers/withLinks.js';
import { ShadowAssignmentIcon, EditIcon } from '../../icons';
import { createGroupLinks } from './linkCreators.js';

const ShadowAssignmentNavigation = ({ shadowId, groupId, canEdit = false, links }) => (
  <Navigation
    shadowId={shadowId}
    links={[
      {
        caption: <FormattedMessage id="app.navigation.shadowAssignment" defaultMessage="Shadow Assignment" />,
        link: links.SHADOW_ASSIGNMENT_DETAIL_URI_FACTORY(shadowId),
        icon: <ShadowAssignmentIcon gapRight />,
      },
      canEdit && {
        caption: <FormattedMessage id="app.navigation.edit" defaultMessage="Edit" />,
        link: links.SHADOW_ASSIGNMENT_EDIT_URI_FACTORY(shadowId),
        icon: <EditIcon gapRight />,
      },
      ...createGroupLinks(links, groupId, true) /* true = detail, no edit */,
    ]}
  />
);

ShadowAssignmentNavigation.propTypes = {
  shadowId: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  canEdit: PropTypes.bool,
  links: PropTypes.object.isRequired,
};

export default withLinks(ShadowAssignmentNavigation);
