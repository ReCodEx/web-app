import React, { PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { FormattedMessage } from 'react-intl';

import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuGroup from '../../AdminLTE/Sidebar/MenuGroup';
import { getId } from '../../../redux/helpers/resourceManager';

import withLinks from '../../../hoc/withLinks';

const Student = (
  {
    currentUrl,
    studentOf,
    isCollapsed,
    notifications,
    links: { GROUP_URI_FACTORY }
  }
) => (
  <ul className="sidebar-menu">
    <MenuTitle
      title={
        <FormattedMessage
          id="app.sudebar.menu.student.title"
          defaultMessage="Student"
        />
      }
    />
    <MenuGroup
      title={
        <FormattedMessage
          id="app.sidebar.menu.studentOf"
          defaultMessage="Groups"
        />
      }
      items={studentOf.toList()}
      notifications={notifications}
      icon="puzzle-piece"
      currentPath={currentUrl}
      createLink={item => GROUP_URI_FACTORY(getId(item))}
      forceOpen={isCollapsed}
    />
  </ul>
);

Student.propTypes = {
  currentUrl: PropTypes.string.isRequired,
  studentOf: ImmutablePropTypes.map,
  isCollapsed: PropTypes.bool,
  notifications: PropTypes.object,
  links: PropTypes.object
};

export default withLinks(Student);
