import { connect } from 'react-redux';
import Sidebar from '../../components/Sidebar/Sidebar';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { memberOfInstances } from '../../redux/selectors/instances';
import { studentOfSelector, supervisorOfSelector } from '../../redux/selectors/groups';
import { notificationsSelector, isSuperAdmin } from '../../redux/selectors/users';

const mapStateToProps = (state) => {
  const userId = loggedInUserIdSelector(state);
  return {
    instances: memberOfInstances(userId)(state),
    studentOf: studentOfSelector(userId)(state),
    isAdmin: isSuperAdmin(userId)(state),
    supervisorOf: supervisorOfSelector(userId)(state),
    notifications: notificationsSelector(state)
  };
};

export default connect(mapStateToProps)(Sidebar);
