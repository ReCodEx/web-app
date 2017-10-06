import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';

// import Admin from '../Admin';
import Public from './Public';
import LoggedIn from './LoggedIn';
import Admin from './Admin';
import Student from './Student';
import Supervisor from './Supervisor';
import BadgeContainer from '../../../containers/BadgeContainer';

const Sidebar = ({
  isLoggedIn = false,
  studentOf,
  supervisorOf,
  isAdmin,
  isSupervisor,
  small = false,
  ...props
}) => (
  <aside className="main-sidebar">
    <section className="sidebar">
      {isLoggedIn && <BadgeContainer small={small} />}
      {isLoggedIn && <LoggedIn {...props} />}

      {studentOf &&
        studentOf.size > 0 && <Student {...props} studentOf={studentOf} />}

      {(isAdmin || isSupervisor) && (
        <Supervisor {...props} supervisorOf={supervisorOf} />
      )}

      {isAdmin && <Admin {...props} />}

      {!isLoggedIn && <Public {...props} />}
    </section>
  </aside>
);

Sidebar.propTypes = {
  isLoggedIn: PropTypes.bool,
  studentOf: ImmutablePropTypes.map,
  supervisorOf: ImmutablePropTypes.map,
  isAdmin: PropTypes.bool,
  isSupervisor: PropTypes.bool,
  small: PropTypes.bool
};

export default Sidebar;
