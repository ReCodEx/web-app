import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';
import ResourceRenderer from '../../components/helpers/ResourceRenderer';

class UsersSimpleNameContainer extends Component {
  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.userId !== newProps.userId) {
      newProps.loadAsync();
    }
  }

  static loadAsync = ({ userId }, dispatch) => {
    dispatch(fetchUserIfNeeded(userId));
  };

  render() {
    const { user } = this.props;
    return (
      <ResourceRenderer resource={user}>
        {user =>
          <span>
            &nbsp;&nbsp;{user.name.firstName}&nbsp;{user.name.lastName}&nbsp;&nbsp;
          </span>}
      </ResourceRenderer>
    );
  }
}

UsersSimpleNameContainer.propTypes = {
  userId: PropTypes.string.isRequired,
  user: ImmutablePropTypes.map,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { userId }) => ({
    user: getUser(userId)(state)
  }),
  (dispatch, { userId }) => ({
    loadAsync: () => UsersSimpleNameContainer.loadAsync({ userId }, dispatch)
  })
)(UsersSimpleNameContainer);
