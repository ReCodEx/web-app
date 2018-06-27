import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';
import { push } from 'react-router-redux';
import { Table } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

import {
  SettingsIcon,
  TransferIcon,
  LoadingIcon
} from '../../components/icons';
import Button from '../../components/widgets/FlatButton';
import DeleteUserButtonContainer from '../../containers/DeleteUserButtonContainer';
import Page from '../../components/layout/Page';
import Box from '../../components/widgets/Box';
import UsersList from '../../components/Users/UsersList';
import PaginationContainer from '../../containers/PaginationContainer';
import SearchContainer from '../../containers/SearchContainer';
import {
  loggedInUserSelector,
  isLoggedAsSuperAdmin
} from '../../redux/selectors/users';
import { takeOver } from '../../redux/modules/auth';
import { searchPeople } from '../../redux/modules/search';

import withLinks from '../../helpers/withLinks';
import { getSearchQuery } from '../../redux/selectors/search';
import { selectedInstanceId } from '../../redux/selectors/auth';

class Users extends Component {
  render() {
    const {
      instanceId,
      takeOver,
      isSuperAdmin,
      search,
      query,
      user,
      links: { EDIT_USER_URI_FACTORY, DASHBOARD_URI }
    } = this.props;

    return (
      <Page
        title={
          <FormattedMessage id="app.users.title" defaultMessage="User list" />
        }
        resource={user}
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
        {user =>
          <div>
            <Box
              title={
                <FormattedMessage
                  id="app.users.listTitle"
                  defaultMessage="Users"
                />
              }
              unlimitedHeight
            >
              <PaginationContainer entities="users">
                {data =>
                  <UsersList
                    users={data}
                    loggedUserId={user.id}
                    useGravatar={user.privateData.settings.useGravatar}
                    createActions={userId =>
                      <div>
                        <LinkContainer to={EDIT_USER_URI_FACTORY(userId)}>
                          <Button bsSize="xs" bsStyle="warning">
                            <SettingsIcon gapRight />
                            <FormattedMessage
                              id="generic.settings"
                              defaultMessage="Settings"
                            />
                          </Button>
                        </LinkContainer>
                        {isSuperAdmin &&
                          <Button
                            bsSize="xs"
                            bsStyle="primary"
                            onClick={() => takeOver(userId, DASHBOARD_URI)}
                          >
                            <TransferIcon gapRight />
                            <FormattedMessage
                              id="app.users.takeOver"
                              defaultMessage="Login as"
                            />
                          </Button>}
                        <DeleteUserButtonContainer
                          id={userId}
                          bsSize="xs"
                          resourceless={true}
                          onDeleted={() => search(instanceId)(query)}
                        />
                      </div>}
                  />

                /* <Table>
                    <tbody>
                      {data.map(
                        (user, idx) =>
                          user
                            ? <tr key={idx}>
                                <td>
                                  {user.id}
                                </td>
                                <td>
                                  {user.fullName}
                                </td>
                              </tr>
                            : <tr key={idx}>
                                <td colSpan={2}>
                                  <LoadingIcon />
                                </td>
                              </tr>
                      )}
                    </tbody>
                    </Table> */
                }
              </PaginationContainer>
            </Box>

            {false &&
              instanceId &&
              <Box
                title={
                  <FormattedMessage
                    id="app.users.listTitle"
                    defaultMessage="Users"
                  />
                }
                unlimitedHeight
              >
                <SearchContainer
                  type="users"
                  id="users-page"
                  search={search(instanceId)}
                  showAllOnEmptyQuery={true}
                  renderList={users =>
                    <UsersList
                      users={users}
                      loggedUserId={user.id}
                      useGravatar={user.privateData.settings.useGravatar}
                      createActions={userId =>
                        <div>
                          <LinkContainer to={EDIT_USER_URI_FACTORY(userId)}>
                            <Button bsSize="xs" bsStyle="warning">
                              <SettingsIcon gapRight />
                              <FormattedMessage
                                id="generic.settings"
                                defaultMessage="Settings"
                              />
                            </Button>
                          </LinkContainer>
                          {isSuperAdmin &&
                            <Button
                              bsSize="xs"
                              bsStyle="primary"
                              onClick={() => takeOver(userId, DASHBOARD_URI)}
                            >
                              <TransferIcon gapRight />
                              <FormattedMessage
                                id="app.users.takeOver"
                                defaultMessage="Login as"
                              />
                            </Button>}
                          <DeleteUserButtonContainer
                            id={userId}
                            bsSize="xs"
                            resourceless={true}
                            onDeleted={() => search(instanceId)(query)}
                          />
                        </div>}
                    />}
                />
              </Box>}
          </div>}
      </Page>
    );
  }
}

Users.propTypes = {
  instanceId: PropTypes.string,
  push: PropTypes.func.isRequired,
  links: PropTypes.object.isRequired,
  takeOver: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool,
  search: PropTypes.func,
  query: PropTypes.string,
  user: ImmutablePropTypes.map.isRequired
};

export default withLinks(
  connect(
    state => {
      return {
        instanceId: selectedInstanceId(state),
        isSuperAdmin: isLoggedAsSuperAdmin(state),
        user: loggedInUserSelector(state),
        query: getSearchQuery('users-page')(state)
      };
    },
    dispatch => ({
      push: url => dispatch(push(url)),
      takeOver: (userId, redirectUrl) =>
        dispatch(takeOver(userId)).then(() => dispatch(push(redirectUrl))),
      search: instanceId => query =>
        dispatch(searchPeople(instanceId)('users-page', query))
    })
  )(Users)
);
