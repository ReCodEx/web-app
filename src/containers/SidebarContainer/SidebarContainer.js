import { connect } from 'react-redux';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { loggedInUserMemberOfInstances } from '../../redux/selectors/instances';
import {
  loggedInStudentOfSelector,
  loggedInSupervisorOfSelector
} from '../../redux/selectors/usersGroups';
import {
  notificationsSelector,
  isSupervisor,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';

const mapStateToProps = state => {
  const userId = loggedInUserIdSelector(state);
  return {
    instances: loggedInUserMemberOfInstances(state),
    studentOf: loggedInStudentOfSelector(state),
    isAdmin: isLoggedAsSuperAdmin(state),
    isSupervisor: isSupervisor(userId)(state),
    supervisorOf: loggedInSupervisorOfSelector(state),
    notifications: notificationsSelector(state)
  };
};

export default connect(mapStateToProps)(Sidebar);
