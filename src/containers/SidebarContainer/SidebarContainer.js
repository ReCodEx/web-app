import { connect } from 'react-redux';
import Sidebar from '../../components/layout/Sidebar/Sidebar.js';
import { loggedInUserMemberOfInstances } from '../../redux/selectors/instances.js';
import {
  loggedInUserSelector,
  notificationsSelector,
  getLoggedInUserEffectiveRole,
} from '../../redux/selectors/users.js';

export default connect(state => ({
  loggedInUser: loggedInUserSelector(state),
  effectiveRole: getLoggedInUserEffectiveRole(state),
  instances: loggedInUserMemberOfInstances(state),
  notifications: notificationsSelector(state),
}))(Sidebar);
