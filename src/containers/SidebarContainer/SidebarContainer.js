import { connect } from 'react-redux';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { loggedInUserMemberOfInstances } from '../../redux/selectors/instances';
import {
  loggedInStudentOfSelector,
  loggedInSupervisorOfNonOrganizationalSelector,
} from '../../redux/selectors/usersGroups';
import { loggedInUserSelector, notificationsSelector } from '../../redux/selectors/users';

const mapStateToProps = state => {
  return {
    loggedInUser: loggedInUserSelector(state),
    instances: loggedInUserMemberOfInstances(state),
    studentOf: loggedInStudentOfSelector(state),
    supervisorOf: loggedInSupervisorOfNonOrganizationalSelector(state),
    notifications: notificationsSelector(state),
  };
};

export default connect(mapStateToProps)(Sidebar);
