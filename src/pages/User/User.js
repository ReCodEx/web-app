import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';
import Page from '../../components/Page';
import UserProfile from '../../components/Users/UserProfile';

class User extends Component {

  static loadAsync = ({ userId }, dispatch) => Promise.all([
    dispatch(fetchUserIfNeeded(userId))
  ]);

  componentWillMount() {
    this.props.loadAsync();
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.userId !== newProps.params.userId) {
      newProps.loadAsync();
    }
  }

  render() {
    const { user } = this.props;
    return (
      <Page
        resource={user}
        title={(user) => user.fullName}
        description={<FormattedMessage id='app.user.title' defaultMessage="User's profile" />}
        breadcrumbs={[
          {
            text: <FormattedMessage id='app.user.title' defaultMessage="User's profile" />,
            iconName: 'user'
          }
        ]}>
        {data => <UserProfile {...data} />}
      </Page>
    );
  }

}

User.propTypes = {
  user: ImmutablePropTypes.map,
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired
};

export default connect(
  (state, { params: { userId } }) => ({
    user: getUser(userId)(state)
  }),
  (dispatch, { params }) => ({
    loadAsync: () => User.loadAsync(params, dispatch)
  })
)(User);
