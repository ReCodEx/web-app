import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import UserSwitching from '../../components/Users/UserSwitching';

import { switchUser } from '../../redux/modules/userSwitching';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import { usersSelector } from '../../redux/selectors/userSwitching';

UserSwitching.propTypes = {
  currentUserId: PropTypes.string.isRequired,
  users: PropTypes.array.isRequired,
  open: PropTypes.bool,
  loginAs: PropTypes.func.isRequired
};

export default connect(
  state => ({
    currentUserId: loggedInUserIdSelector(state),
    users: usersSelector(state)
  }),
  dispatch => ({
    loginAs: id => dispatch(switchUser(id))
  })
)(UserSwitching);
