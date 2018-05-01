import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import classNames from 'classnames';
import { FormattedMessage } from 'react-intl';

import Public from './Public';
import LoggedIn from './LoggedIn';
import Admin from './Admin';
import Student from './Student';
import Supervisor from './Supervisor';
import BadgeContainer from '../../../containers/BadgeContainer';
import MenuItem from '../../widgets/Sidebar/MenuItem';

import withLinks from '../../../helpers/withLinks';

import styles from './sidebar.less';

const Sidebar = ({
  isLoggedIn = false,
  studentOf,
  supervisorOf,
  isAdmin,
  isSupervisor,
  small = false,
  links: { FAQ_URL },
  ...props
}) =>
  <aside className={classNames(['main-sidebar', styles.mainSidebar])}>
    <section className="sidebar">
      {isLoggedIn && <BadgeContainer small={small} />}
      {isLoggedIn && <LoggedIn {...props} />}

      {studentOf &&
        studentOf.size > 0 &&
        <Student {...props} studentOf={studentOf} />}

      {(isAdmin || isSupervisor) &&
        <Supervisor {...props} supervisorOf={supervisorOf} />}

      {!isLoggedIn && <Public {...props} />}

      <ul className="sidebar-menu">
        <MenuItem
          title={
            <FormattedMessage id="app.sidebar.menu.faq" defaultMessage="FAQ" />
          }
          icon="blind"
          link={FAQ_URL}
          currentPath={props.currentUrl}
        />
      </ul>

      {isAdmin && <Admin {...props} />}
    </section>
  </aside>;

Sidebar.propTypes = {
  isLoggedIn: PropTypes.bool,
  studentOf: ImmutablePropTypes.map,
  supervisorOf: ImmutablePropTypes.map,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  currentUrl: PropTypes.string,
  small: PropTypes.bool,
  links: PropTypes.object
};

export default withLinks(Sidebar);
