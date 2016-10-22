import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';
import { isReady, getJsData } from '../../redux/helpers/resourceManager';
import PageContent from '../../components/PageContent';
import ResourceRenderer from '../../components/ResourceRenderer';
import UserProfile, {
  LoadingUserProfile,
  FailedUserProfile
} from '../../components/Users/UserProfile';

class User extends Component {

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
    const title = isReady(user)
      ? getJsData(user).fullName
      : <FormattedMessage id='app.user.loading' defaultMessage="Loading user's profile" />;

    return (
      <PageContent
        title={title}
        description={<FormattedMessage id='app.user.title' defaultMessage="User's profile" />}
        breadcrumbs={[
          { text: <FormattedMessage id='app.user.title' defaultMessage="User's profile" />, iconName: 'user' }
        ]}>
        <ResourceRenderer
          resource={user}
          loading={<LoadingUserProfile />}
          failed={<FailedUserProfile />}>
          {data => <UserProfile {...data} />}
        </ResourceRenderer>
      </PageContent>
    );
  }

}

export default connect(
  (state, { params: { userId } }) => ({
    user: getUser(userId)(state)
  }),
  (dispatch, { params: { userId } }) => ({
    loadAsync: () => Promise.all([
      dispatch(fetchUserIfNeeded(userId))
    ])
  })
)(User);
