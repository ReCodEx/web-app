import { connect } from 'react-redux';
import Sidebar from '../../components/layout/Sidebar/Sidebar';
import { loggedInUserMemberOfInstances } from '../../redux/selectors/instances';
import { loggedInUserSelector, notificationsSelector, getLoggedInUserEffectiveRole } from '../../redux/selectors/users';

export default connect(state => ({
  loggedInUser: loggedInUserSelector(state),
  effectiveRole: getLoggedInUserEffectiveRole(state),
  instances: loggedInUserMemberOfInstances(state),
  notifications: notificationsSelector(state),
}))(Sidebar);
