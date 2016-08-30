import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { List } from 'immutable';

import { isReady } from '../../../redux/helpers/resourceManager';
import BadgeContainer from '../../../containers/BadgeContainer';
import MenuTitle from '../../AdminLTE/Sidebar/MenuTitle';
import MenuItem from '../../AdminLTE/Sidebar/MenuItem';
import MenuGroup from '../../AdminLTE/Sidebar/MenuGroup';

const LoggedIn = ({
  instances,
  studentOf,
  supervisorOf,
  notifications,
  isCollapsed,
  currentUrl
}, {
  links: {
    HOME_URI,
    DASHBOARD_URI,
    GROUP_URI_FACTORY,
    BUGS_URL,
    INSTANCE_URI_FACTORY
  }
}) => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      <BadgeContainer />
      <ul className='sidebar-menu'>
        <MenuTitle title={<FormattedMessage id='app.sidebar.menu.title' defaultMessage='Menu' />} />
        <MenuItem
          title={<FormattedMessage id='app.sidebar.menu.dashboard' defaultMessage='Dashboard' />}
          icon='dashboard'
          currentPath={currentUrl}
          link={DASHBOARD_URI} />

        {instances && instances.size > 0 && instances.toArray().map(
          instance => isReady(instance) && (
            <MenuItem
              key={instance.getIn(['data', 'id'])}
              title={instance.getIn([ 'data', 'name' ])}
              icon='university'
              currentPath={currentUrl}
              link={INSTANCE_URI_FACTORY(instance.getIn([ 'data', 'id' ]))} />
          )
        )}

        {studentOf && studentOf.size > 0 && (
          <MenuGroup
            title={<FormattedMessage id='app.sidebar.menu.studentOf' defaultMessage='Groups - student' />}
            items={studentOf}
            notifications={notifications}
            icon='puzzle-piece'
            currentPath={currentUrl}
            createLink={item => GROUP_URI_FACTORY(item.getIn(['data', 'id']))}
            forceOpen={isCollapsed} />
        )}
        {supervisorOf && supervisorOf.size > 0 && (
          <MenuGroup
            title={<FormattedMessage id='app.sidebar.menu.supervisorOf' defaultMessage='Groups - supervisor' />}
            items={supervisorOf}
            notifications={notifications}
            icon='wrench'
            currentPath={currentUrl}
            createLink={item => GROUP_URI_FACTORY(item.getIn(['data', 'id']))}
            forceOpen={isCollapsed} />
        )}
        <MenuItem
          title={<FormattedMessage id='app.sidebar.menu.feedbackAndBugs' defaultMessage='Feedback and bug reporting' />}
          isActive={false}
          icon='bug'
          link={BUGS_URL}
          currentPath={currentUrl}
          inNewTab={true} />
      </ul>
    </section>
  </aside>
);

LoggedIn.propTypes = {
  supervisorOf: PropTypes.instanceOf(List),
  studentOf: PropTypes.instanceOf(List),
  isCollapsed: PropTypes.bool
};

LoggedIn.contextTypes = {
  links: PropTypes.object,
  location: PropTypes.object
};

export default LoggedIn;
