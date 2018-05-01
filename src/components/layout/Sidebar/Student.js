import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import MenuGroup from '../../widgets/Sidebar/MenuGroup';
import { getId } from '../../../redux/helpers/resourceManager';

import withLinks from '../../../helpers/withLinks';

const Student = ({
  currentUrl,
  studentOf,
  isCollapsed,
  notifications,
  links: { GROUP_DETAIL_URI_FACTORY }
}) =>
  <ul className="sidebar-menu">
    <MenuGroup
      title={
        <FormattedMessage
          id="app.sidebar.menu.memberOfGroups"
          defaultMessage="Member of Groups"
        />
      }
      items={studentOf.toList()}
      notifications={notifications}
      icon={'user-circle'}
      currentPath={currentUrl}
      createLink={item => GROUP_DETAIL_URI_FACTORY(getId(item))}
      forceOpen={isCollapsed}
    />
  </ul>;

Student.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  studentOf: ImmutablePropTypes.map,
  isCollapsed: PropTypes.bool,
  notifications: PropTypes.object,
  links: PropTypes.object
};

export default withLinks(Student);
