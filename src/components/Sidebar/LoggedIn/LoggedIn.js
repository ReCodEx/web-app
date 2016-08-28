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
  logout,
  isActive = link => link === '/',
  isCollapsed
}, {
  links: {
    DASHBOARD_URI,
    GROUP_URI_FACTORY,
    BUGS_URL,
    INSTANCE_URI_FACTORY
  }
}) => (
  <aside className='main-sidebar'>
    <section className='sidebar'>
      <BadgeContainer logout={logout} />
      <ul className='sidebar-menu'>
        <MenuTitle title={<FormattedMessage id='app.sidebar.menu.title' defaultMessage='Menu' />} />
        <MenuItem
          title={<FormattedMessage id='app.sidebar.menu.dashboard' defaultMessage='Dashboard' />}
          isActive={isActive(DASHBOARD_URI)}
          icon='dashboard'
          link={DASHBOARD_URI} />

        {instances && instances.size > 0 && instances.toArray().map(
          instance => isReady(instance) && (
            <MenuItem
              key={instance.getIn(['data', 'id'])}
              title={instance.getIn([ 'data', 'name' ])}
              isActive={isActive(INSTANCE_URI_FACTORY(instance.getIn([ 'data', 'id' ])))}
              icon='university'
              link={INSTANCE_URI_FACTORY(instance.getIn([ 'data', 'id' ]))} />
          )
        )}

        {studentOf && studentOf.size > 0 && (
          <MenuGroup
            title={<FormattedMessage id='app.sidebar.menu.studentOf' defaultMessage='Groups - student' />}
            items={studentOf}
            notifications={notifications}
            icon='puzzle-piece'
            isActive={studentOf.some(item => isReady(item) && isActive(GROUP_URI_FACTORY(item.getIn(['data', 'id']))))}
            createLink={item => GROUP_URI_FACTORY(item.getIn(['data', 'id']))}
            forceOpen={isCollapsed} />
        )}
        {supervisorOf && supervisorOf.size > 0 && (
          <MenuGroup
            title={<FormattedMessage id='app.sidebar.menu.supervisorOf' defaultMessage='Groups - supervisor' />}
            items={supervisorOf}
            notifications={notifications}
            icon='wrench'
            isActive={supervisorOf.some(item => isReady(item) && isActive(GROUP_URI_FACTORY(item.getIn(['data', 'id']))))}
            createLink={item => GROUP_URI_FACTORY(item.getIn(['data', 'id']))}
            forceOpen={isCollapsed} />
        )}
        <MenuItem
          title={<FormattedMessage id='app.sidebar.menu.feedbackAndBugs' defaultMessage='Feedback and bug reporting' />}
          isActive={false}
          icon='bug'
          link={BUGS_URL}
          inNewTab={true} />
      </ul>
    </section>
  </aside>
);

LoggedIn.propTypes = {
  supervisorOf: PropTypes.instanceOf(List),
  studentOf: PropTypes.instanceOf(List),
  logout: PropTypes.func.isRequired,
  isActive: PropTypes.func,
  isCollapsed: PropTypes.bool
};

LoggedIn.contextTypes = {
  links: PropTypes.object
};

export default LoggedIn;
