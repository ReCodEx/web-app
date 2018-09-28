import { connect } from 'react-redux';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { loggedInUserMemberOfInstances } from '../../redux/selectors/instances';
import {
  loggedInStudentOfSelector,
  loggedInSupervisorOfNonOrganizationalSelector
} from '../../redux/selectors/usersGroups';
import { notificationsSelector, getRole } from '../../redux/selectors/users';

const mapStateToProps = state => {
  const userId = loggedInUserIdSelector(state);
  return {
    instances: loggedInUserMemberOfInstances(state),
    role: getRole(userId)(state),
    studentOf: loggedInStudentOfSelector(state),
    supervisorOf: loggedInSupervisorOfNonOrganizationalSelector(state),
    notifications: notificationsSelector(state)
  };
};

export default connect(mapStateToProps)(Sidebar);
