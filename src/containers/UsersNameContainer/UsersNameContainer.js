import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';
import ResourceRenderer from '../../components/ResourceRenderer';
import UsersName, { LoadingUsersName, FailedUsersName } from '../../components/Users/UsersName';

class UsersNameContainer extends Component {

  componentWillMount() {
    UsersNameContainer.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.userId !== newProps.userId) {
      UsersNameContainer.loadData(newProps);
    }
  }

  static loadData = ({ loadUserIfNeeded }) => {
    loadUserIfNeeded();
  }

  render() {
    const { user } = this.props;
    return (
      <ResourceRenderer
        resource={user}
        loading={<LoadingUsersName size={22} />}
        failed={<FailedUsersName size={22} />}>
        {(user) => <UsersName {...user} size={22} />}
      </ResourceRenderer>
    );
  }

}

UsersNameContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  user: ImmutablePropTypes.map
};

export default connect(
  (state, { userId }) => ({
    user: getUser(userId)(state)
  }),
  (dispatch, { userId }) => ({
    loadUserIfNeeded: () => dispatch(fetchUserIfNeeded(userId))
  })
)(UsersNameContainer);
