import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import { isReady } from '../../../redux/helpers/resourceManager';
import BadgeContainer from '../../../containers/BadgeContainer';
import MenuTitle from '../MenuTitle';
import MenuItem from '../MenuItem';
import MenuGroup from '../MenuGroup';

import {
  DASHBOARD_URI,
  GROUP_URI_FACTORY,
  BUGS_URL
} from '../../../links';

const LoggedIn = ({
  user,
  studentOf,
  supervisorOf,
  logout,
  isActive = link => link === '/'
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
        {studentOf.length > 0 && (
          <MenuGroup
            title={<FormattedMessage id='app.sidebar.menu.studentOf' defaultMessage='Groups - student' />}
            items={studentOf}
            icon='puzzle-piece'
            isActive={studentOf.some(item => isReady(item) && isActive(GROUP_URI_FACTORY(item.data.id)))}
            createLink={item => GROUP_URI_FACTORY(item.data.id)} />
        )}
        {studentOf.length > 0 && (
          <MenuGroup
            title={<FormattedMessage id='app.sidebar.menu.supervisorOf' defaultMessage='Groups - supervisor' />}
            items={supervisorOf}
            icon='wrench'
            isActive={supervisorOf.some(item => isReady(item) && isActive(GROUP_URI_FACTORY(item.data.id)))}
            createLink={item => GROUP_URI_FACTORY(item.data.id)} />
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
  user: PropTypes.shape({
    fullName: PropTypes.string,
    avatarUrl: PropTypes.string,
    institution: PropTypes.string
  }),
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any.isRequired,
      name: PropTypes.string.isRequired,
      abbr: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired
    })
  )
};

export default LoggedIn;
