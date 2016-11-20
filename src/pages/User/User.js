import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import { fetchUserIfNeeded } from '../../redux/modules/users';
import { getUser } from '../../redux/selectors/users';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';
import Page from '../../components/Page';
import { EditIcon } from '../../components/Icons';
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
    const { user, loggedInUserId } = this.props;
    const { links: { EDIT_USER_URI_FACTORY } } = this.context;
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
        {data => (
          <div>
            <UserProfile {...data} />
            {data.id === loggedInUserId && (
              <p className='text-center'>
                <LinkContainer to={EDIT_USER_URI_FACTORY(data.id)}>
                  <Button bsStyle='default' className='btn-flat'>
                    <EditIcon /> <FormattedMessage id='app.user.editUser' defaultMessage='Edit profile information' />
                  </Button>
                </LinkContainer>
              </p>
            )}
          </div>
        )}
      </Page>
    );
  }

}

User.propTypes = {
  user: ImmutablePropTypes.map,
  params: PropTypes.shape({ userId: PropTypes.string.isRequired }).isRequired,
  loadAsync: PropTypes.func.isRequired,
  loggedInUserId: PropTypes.string
};

User.contextTypes = {
  links: PropTypes.object
};

export default connect(
  (state, { params: { userId } }) => ({
    user: getUser(userId)(state),
    loggedInUserId: loggedInUserIdSelector(state)
  }),
  (dispatch, { params }) => ({
    loadAsync: () => User.loadAsync(params, dispatch)
  })
)(User);
