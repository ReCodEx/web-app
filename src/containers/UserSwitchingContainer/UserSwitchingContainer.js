import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UserSwitching from '../../components/Users/UserSwitching';

import { switchUser, removeUser } from '../../redux/modules/userSwitching.js';
import { loggedInUserSelector } from '../../redux/selectors/users.js';
import { usersSelector } from '../../redux/selectors/userSwitching.js';

UserSwitching.propTypes = {
  currentUser: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  open: PropTypes.bool,
  loginAs: PropTypes.func.isRequired,
};

export default connect(
  state => ({
    currentUser: loggedInUserSelector(state),
    users: usersSelector(state),
  }),
  dispatch => ({
    loginAs: id => dispatch(switchUser(id)),
    removeUser: id => dispatch(removeUser(id)),
  })
)(UserSwitching);
