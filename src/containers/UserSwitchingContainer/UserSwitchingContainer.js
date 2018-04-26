import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UserSwitching from '../../components/Users/UserSwitching';

import { switchUser } from '../../redux/modules/userSwitching';
import { loggedInUserSelector } from '../../redux/selectors/users';
import { usersSelector } from '../../redux/selectors/userSwitching';

UserSwitching.propTypes = {
  currentUser: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  open: PropTypes.bool,
  loginAs: PropTypes.func.isRequired
};

export default connect(
  state => ({
    currentUser: loggedInUserSelector(state),
    users: usersSelector(state)
  }),
  dispatch => ({
    loginAs: id => dispatch(switchUser(id))
  })
)(UserSwitching);
