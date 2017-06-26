import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';

import { SettingsIcon } from '../../components/icons';
import Button from '../../components/widgets/FlatButton';
import DeleteUserButtonContainer
  from '../../containers/DeleteUserButtonContainer';
import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import UsersList from '../../components/Users/UsersList';
import { usersSelector } from '../../redux/selectors/users';
import { fetchAllUsers } from '../../redux/modules/users';

import withLinks from '../../hoc/withLinks';

class Users extends Component {
  static loadAsync = (params, dispatch) => dispatch(fetchAllUsers);

  componentWillMount() {
    this.props.loadAsync();
  }

  render() {
    const { users, links: { EDIT_USER_URI_FACTORY } } = this.props;

    return (
      <Page
        resource={users.toArray()}
        title={
          <FormattedMessage id="app.users.title" defaultMessage="User list" />
        }
        description={
          <FormattedMessage
            id="app.users.description"
            defaultMessage="Browse all ReCodEx users."
          />
        }
        breadcrumbs={[
          {
            text: (
              <FormattedMessage id="app.users.users" defaultMessage="Users" />
            ),
            iconName: 'users'
          }
        ]}
      >
        {(...users) => (
          <div>
            <Box
              title={
                <FormattedMessage
                  id="app.users.listTitle"
                  defaultMessage="Users"
                />
              }
              noPadding
              unlimitedHeight
            >
              <UsersList
                users={users}
                createActions={userId => (
                  <div>
                    <LinkContainer to={EDIT_USER_URI_FACTORY(userId)}>
                      <Button bsSize="xs" className="btn-flat">
                        <SettingsIcon />
                        {' '}
                        <FormattedMessage
                          id="app.users.settings"
                          defaultMessage="Settings"
                        />
                      </Button>
                    </LinkContainer>
                    <DeleteUserButtonContainer id={userId} bsSize="xs" />
                  </div>
                )}
              />
            </Box>
          </div>
        )}
      </Page>
    );
  }
}

Users.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  users: ImmutablePropTypes.map
};

export default withLinks(
  connect(
    state => ({
      users: usersSelector(state)
    }),
    dispatch => ({
      push: url => dispatch(push(url)),
      loadAsync: () => Users.loadAsync({}, dispatch)
    })
  )(Users)
);
