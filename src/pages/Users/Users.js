import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { LinkContainer } from 'react-router-bootstrap';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  InputGroup
} from 'react-bootstrap';

import { SettingsIcon, SearchIcon, TransferIcon } from '../../components/icons';
import Button from '../../components/widgets/FlatButton';
import DeleteUserButtonContainer from '../../containers/DeleteUserButtonContainer';
import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import UsersList from '../../components/Users/UsersList';
import { usersSelector, isSuperAdmin } from '../../redux/selectors/users';
import { fetchAllUsers } from '../../redux/modules/users';
import { takeOver } from '../../redux/modules/auth';
import { loggedInUserIdSelector } from '../../redux/selectors/auth';

import withLinks from '../../hoc/withLinks';

class Users extends Component {
  static loadAsync = (params, dispatch) => dispatch(fetchAllUsers);

  componentWillMount() {
    this.props.loadAsync();
    this.setState({ visibleUsers: [] });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      visibleUsers: nextProps.users.toArray().map(user => user.toJS().data)
    });
  }

  onChange(query, allUsers) {
    const normalizedQuery = query.toLocaleLowerCase();
    const filteredUsers = allUsers.filter(
      user =>
        user.name.lastName.toLocaleLowerCase().startsWith(normalizedQuery) ||
        user.fullName.toLocaleLowerCase().startsWith(normalizedQuery) ||
        user.id.toLocaleLowerCase().startsWith(normalizedQuery)
    );
    this.setState({
      visibleUsers: filteredUsers
    });
  }

  render() {
    const {
      users,
      links: { EDIT_USER_URI_FACTORY, DASHBOARD_URI },
      takeOver,
      isSuperAdmin
    } = this.props;

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
        {(...users) =>
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
              <div>
                <form style={{ padding: '10px' }}>
                  <FormGroup>
                    <ControlLabel>
                      <FormattedMessage
                        id="app.search.title"
                        defaultMessage="Search:"
                      />
                    </ControlLabel>
                    <InputGroup>
                      <FormControl
                        onChange={e => {
                          this.query = e.target.value;
                        }}
                      />
                      <InputGroup.Button>
                        <Button
                          type="submit"
                          onClick={e => {
                            e.preventDefault();
                            this.onChange(this.query, users);
                          }}
                          disabled={false}
                        >
                          <SearchIcon />
                        </Button>
                      </InputGroup.Button>
                    </InputGroup>
                  </FormGroup>
                </form>
                <UsersList
                  users={this.state.visibleUsers}
                  createActions={userId =>
                    <div>
                      <LinkContainer to={EDIT_USER_URI_FACTORY(userId)}>
                        <Button bsSize="xs">
                          <SettingsIcon />{' '}
                          <FormattedMessage
                            id="app.users.settings"
                            defaultMessage="Settings"
                          />
                        </Button>
                      </LinkContainer>
                      {isSuperAdmin &&
                        <Button
                          bsSize="xs"
                          onClick={() => takeOver(userId, DASHBOARD_URI)}
                        >
                          <TransferIcon />{' '}
                          <FormattedMessage
                            id="app.users.takeOver"
                            defaultMessage="Login as"
                          />
                        </Button>}
                      <DeleteUserButtonContainer id={userId} bsSize="xs" />
                    </div>}
                />
              </div>
            </Box>
          </div>}
      </Page>
    );
  }
}

Users.propTypes = {
  loadAsync: PropTypes.func.isRequired,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  users: ImmutablePropTypes.map,
  takeOver: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool
};

export default withLinks(
  connect(
    state => ({
      users: usersSelector(state),
      isSuperAdmin: isSuperAdmin(loggedInUserIdSelector(state))(state)
    }),
    dispatch => ({
      push: url => dispatch(push(url)),
      loadAsync: () => Users.loadAsync({}, dispatch),
      takeOver: (userId, redirectUrl) =>
        dispatch(takeOver(userId)).then(() => dispatch(push(redirectUrl)))
    })
  )(Users)
);
