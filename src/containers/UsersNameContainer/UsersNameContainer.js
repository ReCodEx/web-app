import React, { PropTypes, Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';
import UsersName, {
  LoadingUsersName,
  FailedUsersName
} from '../../components/Users/UsersName';

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
  };

  render() {
    const { user, large, noLink } = this.props;
    const size = large ? 45 : 22;
    return (
      <ResourceRenderer
        resource={user}
        loading={<LoadingUsersName size={size} />}
        failed={<FailedUsersName size={size} />}
      >
        {user => (
          <UsersName {...user} large={large} size={size} noLink={noLink} />
        )}
      </ResourceRenderer>
    );
  }
}

UsersNameContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  large: PropTypes.bool,
  user: ImmutablePropTypes.map,
  noLink: PropTypes.bool
};

export default connect(
  (state, { userId }) => ({
    user: getUser(userId)(state)
  }),
  (dispatch, { userId }) => ({
    loadUserIfNeeded: () => dispatch(fetchUserIfNeeded(userId))
  })
)(UsersNameContainer);
