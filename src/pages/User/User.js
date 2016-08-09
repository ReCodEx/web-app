import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { isReady, isLoading, hasFailed } from '../../redux/helpers/resourceManager';
import PageContent from '../../components/PageContent';
import UserProfile, {
  LoadingUserProfile,
  FailedUserProfile
} from '../../components/Users/UserProfile';

class User extends Component {

  componentWillMount() {
    User.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    if (this.props.params.userId !== newProps.params.userId) {
      User.loadData(newProps);
    }
  }

  static loadData = ({
    params: { userId },
    loadUserIfNeeded
  }) => {
    loadUserIfNeeded(userId);
  };

  render() {
    const {
      user
    } = this.props;

    const userName = isReady(user) ? user.data.fullName : null;
    const title = userName !== null ? userName : 'Načítám ...';

    return (
      <PageContent
        title={title}
        description={<FormattedMessage id='app.user.title' defaultMessage="User's profile" />}
        breadcrumbs={[
          { text: <FormattedMessage id='app.user.title' defaultMessage="User's profile" />, iconName: 'user' }
        ]}>
        <div>
          {isLoading(user) && <LoadingUserProfile />}
          {hasFailed(user) && <FailedUserProfile />}
          {isReady(user) && <UserProfile {...user.data} />}
        </div>
      </PageContent>
    );
  }

}

export default connect(
  (state, props) => ({
    user: state.users.getIn(['resources', props.params.userId])
  }),
  dispatch => ({
    loadUserIfNeeded: (userId) => dispatch(fetchUserIfNeeded(userId))
  })
)(User);
