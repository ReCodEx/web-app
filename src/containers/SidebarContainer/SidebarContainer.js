import { connect } from 'react-redux';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { loggedInUserMemberOfInstances } from '../../redux/selectors/instances';
import {
  loggedInStudentOfSelector,
  loggedInSupervisorOfNonOrganizationalSelector,
} from '../../redux/selectors/usersGroups';
import { loggedInUserSelector, notificationsSelector, getLoggedInUserEffectiveRole } from '../../redux/selectors/users';

export default connect(state => ({
  loggedInUser: loggedInUserSelector(state),
  effectiveRole: getLoggedInUserEffectiveRole(state),
  instances: loggedInUserMemberOfInstances(state),
  studentOf: loggedInStudentOfSelector(state),
  supervisorOf: loggedInSupervisorOfNonOrganizationalSelector(state),
  notifications: notificationsSelector(state),
}))(Sidebar);
